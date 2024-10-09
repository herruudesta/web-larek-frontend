export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface IBasket {
	items: string[];
	total: number;
}

export interface IOrder extends IContactsForm {
	payment: PaymentMethod;
	email: string;
	phone: string;
	address: string;
	items: string[];
	total: number;
}

export type PaymentMethod = 'cash' | 'card';

export type OrderForm = Omit<IOrder, 'total' | 'items'>;

export interface IContactsForm {
	email: string;
	phone: string;
}

export interface IContacts extends IContactsForm {
	items: string[];
}

export type FormErrorsOrder = Partial<Record<keyof IOrder, string>>;
export type FormErrorsContacts = Partial<Record<keyof IContacts, string>>;

export interface IOrderResult {
	id: string;
	total: number;
}
