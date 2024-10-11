import './scss/styles.scss';

import { AppData } from './components/AppData';

import { IProduct, OrderForm, IContactsForm } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

import { Page } from './components/Page';
import { Card } from './components/Card';
import { Order } from './components/Order';
import { clientContacts } from './components/Contacts';

import { Basket } from './components/common/Basket';
import { Modal } from './components/common/Modal';
import { Success } from './components/common/Success';

import { WebLarekAPI } from './components/base/WebLarekApi';
import { EventEmitter } from './components/base/events';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const modalTemplate = ensureElement<HTMLElement>('#modal-container');

// Модель данных приложения
const appData = new AppData(events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(modalTemplate, events);

const basket = new Basket(events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new clientContacts(cloneTemplate(contactsTemplate), events);

//Событие при открытии модального окна блокирует основную страницу.
events.on('modal:open', () => {
	page.locked = true;
});

//Событие при закрытии модального окна разблокирует основную страницу.
events.on('modal:close', () => {
	page.locked = false;
});

//Событие выбирает карточку товара, устанавливая её в режиме предпросмотра.
events.on('card:select', (item: IProduct) => {
	appData.setPreview(item);
});

//Событие обновляет каталог товаров при изменении списка продуктов, создавая новые карточки для отображения.
events.on('items:change', (items: IProduct[]) => {
	page.catalog = items.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render(item);
	});
});

//Событие управляет добавлением и удалением товара из корзины на основе действий пользователя с карточкой товара.
events.on('preview:change', (item: IProduct) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			if (appData.inBasket(item)) {
				appData.removeFromBasket(item);
				card.button = 'В корзину';
			} else {
				appData.addToBasket(item);
				card.button = 'Удалить из корзины';
			}
		},
	});

	card.button = appData.inBasket(item) ? 'Удалить из корзины' : 'В корзину';
	modal.render({
		content: card.render(item),
	});
	modal.open();
});

//Событие обновляет счетчик товаров в корзине и отображает содержимое корзины.
events.on('basket:change', () => {
	page.counter = appData.basket.items.length;

	basket.items = appData.basket.items.map((id) => {
		const item = appData.items.find((item) => item.id === id);
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => appData.removeFromBasket(item),
		});
		return card.render(item);
	});

	basket.total = appData.basket.total;
});

//Событие открывает модальное окно с содержимым корзины.
events.on('basket:open', () => {
	modal.render({ content: basket.render() });
	modal.open();
});

//Событие открывает модальное окно для оформления заказа.
events.on('order:open', () => {
	modal.render({
		content: order.render({
			payment: 'card',
			address: '',
			valid: false,
			errors: [],
		}),
	});
	modal.open();
});

//Событие обрабатывает изменения в полях формы заказа, обновляя данные.
events.on(
	/^order\..*:change/,
	(data: { field: keyof OrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

//Событие управляет состоянием формы и ошибками при оформлении заказа.
events.on('formErrorsOrder:change', (errors: Partial<OrderForm>) => {
	const { address } = errors;
	order.valid = !address;
	order.errors = Object.values({ address }).filter(Boolean).join('; ');
});

//Событие обрабатывает изменения в полях формы контекста.
events.on(
	/^contacts\.[^:]*:change/,
	(data: { field: keyof IContactsForm; value: string }) => {
		appData.setContactsField(data.field, data.value);
	}
);

//Событие обновляет состояние и ошибки в форме контактов.
events.on('formErrorsContacts:change', (errors: Partial<OrderForm>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone }).filter(Boolean).join('; ');
});

//Событие инициализирует процедуру подтверждения заказа, отображая форму для ввода контактной информации.
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});

//Событие отправляет данные заказа и отображает сообщение об успехе. В случае ошибки логирует её в консоль.
events.on('contacts:submit', () => {
	api
		.orderProducts(appData.order)
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});
			appData.clearBasket();
			events.emit('basket:change');
			modal.render({
				content: success.render({ total: appData.order.total }),
			});
			modal.open();
		})
		.catch((err) => {
			console.error(err);
		});
});

// API запрашивает список продуктов через api.getProductList(), устанавливает их в appData при успехе, или выводит ошибку в консоль при неудаче.
api
	.getProductList()
	.then(appData.setItems.bind(appData))
	.catch((err) => console.log(err));
