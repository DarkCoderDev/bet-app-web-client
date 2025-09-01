export const map = {
	"wd": 0, "league": 1, "date": 2, "score": 3, "half1": 4,
	"teams": 5, "p1": 6, "x": 7, "p2": 8, "f10": 9, "f20": 10,
	"1zab": 11, "2zab": 12, "tb25": 13, "tm25": 14, "Over_3": 15,
	"Under_3": 16, "BTTSyes": 17, "BTTSno": 18,
};

// === Utils ===
export const truncate = (value: string, digits: number) => {
	const [intPart, fracPart = ''] = value.split('.');
	if (digits == null || digits <= 0) return intPart + '.';
	return intPart + '.' + fracPart.slice(0, digits).padEnd(digits, '0');
};

// Русские названия для колонок
export const russianNames = {
	"wd": "День",
	"league": "Лига",
	"date": "Дата",
	"score": "Счет",
	"half1": "1Тайм",
	"teams": "Команды",
	"p1": "П1",
	"x": "X",
	"p2": "П2",
	"f10": "Ф10",
	"f20": "Ф20",
	"1zab": "1Заб",
	"2zab": "2Заб",
	"tb25": "ТБ2.5",
	"tm25": "ТМ2.5",
	"Over_3": "О3",
	"Under_3": "П3",
	"BTTSyes": "ОЗ-Да",
	"BTTSno": "ОЗ-Нет"
};

// === Унифицированные модели ===
export const models = [
	{
		label: 'Мат-модель',
		color: '#2e8b57',
		btnText: 'м',
		fields: [
			{key: 'p1', transform: v => truncate(v, 0)},
			{key: 'x', transform: v => truncate(v, 0)},
			{key: 'p2', transform: v => truncate(v, 0)},
			{key: 'f10', transform: v => truncate(v, 0)},
			{key: 'f20', transform: v => truncate(v, 0)},
			{key: '1zab', transform: v => truncate(v, 0)},
			{key: '2zab', transform: v => truncate(v, 0)},
			{key: 'tb25', transform: v => truncate(v, 0)},
			{key: 'tm25', transform: v => truncate(v, 0)},
			{key: 'Over_3', transform: v => truncate(v, 0)},
			{key: 'Under_3', transform: v => truncate(v, 0)},
			{key: 'BTTSyes', transform: v => truncate(v, 0)},
			{key: 'BTTSno', transform: v => truncate(v, 0)}
		]
	},
	{
		label: 'Коридор',
		color: '#2e3d8b',
		btnText: 'к',
		fields: [
			{key: 'p1', transform: v => truncate(v, 1)},
			{key: 'x', transform: v => truncate(v, 1)},
			{key: 'p2', transform: v => truncate(v, 1)},
		]
	},
	{
		label: 'Тотал',
		color: '#8b2e31',
		btnText: 'т',
		fields: [
			{key: 'p1', transform: v => truncate(v, 0)},
			{key: 'x', transform: v => truncate(v, 0)},
			{key: 'p2', transform: v => truncate(v, 0)},
			{key: 'f10', transform: v => truncate(v, 1)},
			{key: 'f20', transform: v => truncate(v, 1)},
			{key: '1zab', transform: v => truncate(v, 1)},
			{key: '2zab', transform: v => truncate(v, 1)},
			{key: 'tb25', transform: v => truncate(v, 1)},
			{key: 'tm25', transform: v => truncate(v, 1)},
			{key: 'Over_3', transform: v => truncate(v, 1)},
			{key: 'Under_3', transform: v => truncate(v, 1)},
			{key: 'BTTSyes', transform: v => truncate(v, 1)},
			{key: 'BTTSno', transform: v => truncate(v, 1)}
		]
	}
];
