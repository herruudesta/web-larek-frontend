import { View } from '../base/Component';
import { EventEmitter } from '../base/events';
import { ensureElement } from '../../utils/utils';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Form<T> extends View<IFormState> {
	protected _submit: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(
		protected container: HTMLFormElement,
		protected events: EventEmitter
	) {
		super(container, events);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	//Вызывает событие изменения для конкретного поля формы, передавая имя поля и его значение.
	protected onInputChange(field: keyof T, value: string) {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	//Устанавливает состояние кнопки отправки формы (активна/неактивна) в зависимости от значения valid.
	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	//Выводит текст ошибок в соответствующий контейнер.
	set errors(value: string) {
		this.setText(this._errors, value);
	}

	//Обновляет состояние формы, устанавливая значения входных полей и отображая состояние формы, включая ошибки.
	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}
