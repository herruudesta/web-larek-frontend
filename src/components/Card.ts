import { IProduct } from '../types';
import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

//Класс для описания карточки
export class Card extends Component<IProduct> {
	// Ссылки на внутренние элементы карточки
	protected _category?: HTMLElement;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _price: HTMLElement;
	protected _button?: HTMLButtonElement;

	protected _categoryColor = new Map<string, string>([
		['софт-скил', '_soft'],
		['хард-скил', '_hard'],
		['кнопка', '_button'],
		['другое', '_other'],
		['дополнительное', '_additional'],
	]);

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);

		this._category = container.querySelector(`.card__category`);
		this._image = container.querySelector(`.card__image`);
		this._description = container.querySelector(`.card__text`);
		this._button = container.querySelector(`.card__button`);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}
	// Сеттер и геттер id
	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}
	// Сеттер и геттер названия
	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}
	// Сеттер картинки
	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}
	// Сеттер и геттер цены
	set price(value: string) {
		if (value) {
			this.setText(this._price, `${value} синапсов`);
		} else {
			this.setText(this._price, 'Бесценно');
		}

		if (this._button) {
			this._button.disabled = !value;
		}
	}

	get price(): string {
		return this._price.textContent || '';
	}

	// Сеттер и геттер категории
	set category(value: string) {
		this.setText(this._category, value);
		this._category?.classList?.remove('card__category_soft');
		this._category?.classList?.remove('card__category_other');
		this._category?.classList?.add(
			`card__category${this._categoryColor.get(value)}`
		);
	}

	get category(): string {
		return this._category.textContent || '';
	}
	// Сеттер описания
	set description(value: string) {
		this.setText(this._description, value);
	}
	// Сеттер кнопки
	set button(value: string) {
		this.setText(this._button, value);
	}
}
