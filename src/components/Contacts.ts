import { OrderForm } from '../types';
import { EventEmitter } from './base/events';
import { Form } from './common/Form';

//Класс описывает окно контактов
export class clientContacts extends Form<OrderForm> {
	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}
}
