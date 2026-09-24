import { randomItem } from '../../shared/data.js';

const pizzas = [
  { ingredients: ['Cheese'], dough: 'Thin' },
  { ingredients: ['Tomatoes', 'Cheese'], dough: 'Thick' },
  { ingredients: ['Pepperoni', 'Mushrooms', 'Olives'], dough: 'Thin' },
];

export function buildPizzaPayload() {
  return randomItem(pizzas);
}

export function buildInvalidPizzaPayload() {
  return { ingredients: [], dough: '' };
}
