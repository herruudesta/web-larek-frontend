import {
	FormErrorsOrder,
	FormErrorsContacts,
	IContactsForm,
	IBasket,
	IOrder,
	IProduct,
	OrderForm,
	PaymentMethod,
} from '../types';
import { IEvents } from './base/events';

export class AppData {
	items: IProduct[] = [];
	basket: IBasket = {
		items: [],
		total: 0,
	};
	preview: IProduct = null;
	order: IOrder = {
		email: '',
		phone: '',
		address: '',
		payment: 'card',
		total: 0,
		items: [],
	};

	formErrorsOrder: FormErrorsOrder = {};
	formErrorsContacts: FormErrorsContacts = {};

	constructor(protected events: IEvents) {}

	setItems(items: IProduct[]) {
		this.items = items;
		this.events.emit('items:change', this.items);
	}

	setPreview(item: IProduct) {
		this.preview = item;
		this.events.emit('preview:change', item);
	}

	inBasket(item: IProduct) {
		return this.basket.items.includes(item.id);
	}

	addToBasket(item: IProduct) {
		this.basket.items.push(item.id);
		this.basket.total += item.price;
		this.events.emit('basket:change', this.basket);
	}

	removeFromBasket(item: IProduct) {
		this.basket.items = this.basket.items.filter((id) => id != item.id);
		this.basket.total -= item.price;
		this.events.emit('basket:change', this.basket);
	}

	clearBasket() {
		this.basket.items = [];
		this.basket.total = 0;
		this.events.emit('basket:change');
	}

	setPaymentMethod(method: PaymentMethod) {
		this.order.payment = method;
	}

	setOrderField(field: keyof OrderForm, value: string) {
		if (field === 'payment') {
			this.setPaymentMethod(value as PaymentMethod);
		} else {
			this.order[field] = value;
		}

		if (this.order.payment && this.validateOrder()) {
			this.order.total = this.basket.total;
			this.order.items = this.basket.items;
		}
	}

	validateOrder() {
		const errors: typeof this.formErrorsOrder = {};

		if (!this.order.address) {
			errors.address = 'Укажите адрес';
		}
		this.formErrorsOrder = errors;
		this.events.emit('formErrorsOrder:change', this.formErrorsOrder);

		return Object.keys(errors).length === 0;
	}

	setContactsField(field: keyof IContactsForm, value: string) {
		this.order[field] = value;
		if (this.validateContacts()) {
			this.events.emit('contacts:ready', this.order);
		}
	}

	validateContacts() {
		const errors: typeof this.formErrorsContacts = {};

		if (!this.order.email) {
			errors.email = 'Укажите email';
		}

		if (!this.order.phone) {
			errors.phone = 'Укажите телефон';
		}
		this.formErrorsContacts = errors;
		this.events.emit('formErrorsContacts:change', this.formErrorsContacts);

		return Object.keys(errors).length === 0;
	}
}
