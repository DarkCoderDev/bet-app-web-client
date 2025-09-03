// ==UserScript==
// @name         baza
// @namespace    http://tampermonkey.net/
// @version      2.0
// @match        https://bet-baza.com/main/total*
// ==/UserScript==

// === CSS ===
const style = document.createElement('style');
style.textContent = `
.baza-btn {
	margin-right: 4px;
	cursor: pointer;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 4px 8px;
	font-size: 12px;
	transition: transform 0.2s, background-color 0.2s;
}
.baza-btn:hover {
	transform: scale(1.05);
}



.baza-btn--save {
	background:rgb(91, 46, 139);
}

/* Модальное окно */
.baza-modal {
	display: none;
	position: fixed;
	z-index: 1000;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0,0,0,0.5);
}

.baza-modal-content {
	background-color: #fefefe;
	margin: 5% auto;
	padding: 20px;
	border: 1px solid #888;
	width: 95%;
	max-width: 1600px;
	max-height: 80vh;
	overflow-y: auto;
	border-radius: 8px;
}

.baza-modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
	border-bottom: 2px solid #ddd;
	padding-bottom: 10px;
}

.baza-modal-actions {
	display: flex;
	align-items: center;
	gap: 15px;
}

.baza-modal-tabs {
	display: flex;
	border-bottom: 1px solid #ddd;
	margin-bottom: 20px;
}

.baza-tab-btn {
	background: none;
	border: none;
	padding: 10px 20px;
	cursor: pointer;
	font-size: 14px;
	border-bottom: 2px solid transparent;
	transition: all 0.2s;
}

.baza-tab-btn:hover {
	background-color: #f8f9fa;
}

.baza-tab-btn.baza-tab-active {
	border-bottom-color: #007bff;
	color: #007bff;
	font-weight: 500;
}

.baza-modal-close {
	color: #aaa;
	font-size: 28px;
	font-weight: bold;
	cursor: pointer;
}

.baza-modal-close:hover {
	color: #000;
}

.baza-saved-match {
	display: grid;
	grid-template-columns: 350px 1fr 120px 100px;
	grid-template-areas: "info filters bet actions";
	align-items: start;
	padding: 8px 12px;
	margin: 2px 0;
	border: 1px solid #dee2e6;
	border-radius: 4px;
	background-color: #ffffff;
	box-shadow: 0 1px 2px rgba(0,0,0,0.05);
	transition: all 0.2s ease;
	gap: 8px;
	min-width: 100%;
	box-sizing: border-box;
}

.baza-saved-match:first-child {
	margin-top: 0;
}

.baza-saved-match:last-child {
	margin-bottom: 0;
}

.baza-saved-match:hover {
	background-color: #f0f0f0;
}

.baza-saved-match.bet-won {
	background-color: #d4edda;
	border-color: #c3e6cb;
}

.baza-saved-match.bet-lost {
	background-color: #f8d7da;
	border-color: #f5c6cb;
}

.baza-saved-match.bet-won:hover {
	background-color: #c3e6cb;
}

.baza-saved-match.bet-lost:hover {
	background-color: #f5c6cb;
}

.baza-saved-match-info {
	position: relative;
}

/* Подсветка строки в основной таблице */
.baza-row-highlighted {
	background-color: #ffeb3b !important;
	position: relative;
}

.baza-row-highlighted:hover {
	background-color: #fdd835 !important;
}

/* Кнопки в подсвеченной строке должны быть поверх подсветки */
.baza-row-highlighted .baza-btn,
.baza-row-highlighted .baza-row-marker {
	position: relative;
	z-index: 2;
}

/* Кнопка-маркер для подсветки строки */
.baza-row-marker {
	width: 20px;
	height: 20px;
	border: none;
	border-radius: 50%;
	background: #6c757d;
	color: white;
	cursor: pointer;
	font-size: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: transform 0.2s ease;
	margin: 0 2px;
	position: relative;
	z-index: 2;
}

.baza-row-marker:hover {
	transform: scale(1.1);
}

.baza-row-marker.active {
	background: #28a745;
	box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.3);
}

/* Дополнительная пагинация для отмеченных матчей */
.baza-marked-pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 20px 0;
	padding: 15px;
	background: #f8f9fa;
	border-radius: 8px;
	border: 1px solid #dee2e6;
}

.baza-marked-pagination-title {
	font-weight: 600;
	color: #495057;
	margin-right: 15px;
}

.baza-marked-pagination-pages {
	display: flex;
	gap: 8px;
	align-items: center;
}

.baza-marked-page-btn {
	padding: 6px 12px;
	border: 1px solid #dee2e6;
	background: white;
	color: #495057;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.2s ease, border-color 0.2s ease;
	font-size: 14px;
}

.baza-marked-page-btn:hover {
	background: #e9ecef;
	border-color: #adb5bd;
}

.baza-marked-page-btn.active {
	background: #007bff;
	color: white;
	border-color: #007bff;
}

.baza-clear-marked-pages-btn {
	padding: 6px 10px;
	border: 1px solid #dc3545;
	background: #dc3545;
	color: white;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.2s ease, border-color 0.2s ease;
	font-size: 14px;
	margin-left: 15px;
}

.baza-clear-marked-pages-btn:hover {
	background: #c82333;
	border-color: #bd2130;
}

.baza-time-group {
	margin-bottom: 25px;
	border: 2px solid #e9ecef;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.baza-time-group-header {
	background: linear-gradient(135deg, #007bff, #0056b3);
	color: white;
	padding: 12px 20px;
	font-weight: 600;
	font-size: 14px;
	text-shadow: 0 1px 2px rgba(0,0,0,0.2);
	border-bottom: 2px solid #e9ecef;
}

.baza-time-group-content {
	padding: 15px;
	background: white;
}

.baza-saved-match-info {
	grid-area: info;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 4px;
	overflow: visible;
}

.baza-match-teams {
	font-size: 13px;
	font-weight: 600;
	color: #2c3e50;
	line-height: 1.2;
	margin: 0;
	white-space: normal;
	word-wrap: break-word;
}

.baza-match-league {
	font-size: 11px;
	color: #7f8c8d;
	font-weight: 500;
	margin: 0;
	white-space: normal;
	word-wrap: break-word;
}

.baza-match-score {
	font-size: 11px;
	color: #34495e;
	margin: 0;
	white-space: normal;
	word-wrap: break-word;
}

.baza-score-value {
	font-weight: 600;
	color: #e74c3c;
}

.baza-score-label {
	font-weight: 600;
	color: #34495e;
	margin-right: 8px;
}

.baza-score-input {
	width: 60px;
	padding: 2px 6px;
	border: 1px solid #ddd;
	border-radius: 3px;
	font-size: 11px;
	text-align: center;
	background: white;
}

.baza-score-input:focus {
	outline: none;
	border-color: #3498db;
	box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.baza-match-odds {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
	margin-bottom: 4px;
}

.baza-odds-item {
	font-size: 11px;
	color: #34495e;
	background: #ecf0f1;
	padding: 2px 6px;
	border-radius: 10px;
	white-space: nowrap;
}

.baza-match-filters {
	grid-area: filters;
	font-size: 10px;
	color: #95a5a6;
	background: #f8f9fa;
	padding: 6px 8px;
	border-radius: 4px;
	border-left: 2px solid #3498db;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.2;
	min-height: 60px;
	display: flex;
	align-items: center;
}

.baza-match-filters::before {
	content: "Фильтры: ";
	font-weight: 600;
	color: #34495e;
}

.baza-filters-table {
	display: flex;
	flex-wrap: nowrap;
	gap: 1px;
	margin: 0;
	padding: 3px 6px;
	background: transparent;
	border: none;
	overflow-x: auto;
	width: 100%;
	justify-content: space-between;
}

.baza-filter-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 30px;
	flex-shrink: 0;
}

.baza-filter-label {
	font-size: 8px;
	font-weight: 600;
	color: #6c757d;
	text-align: center;
	margin-bottom: 1px;
	text-transform: uppercase;
	letter-spacing: 0.2px;
}

.baza-filter-value {
	font-size: 9px;
	font-weight: 500;
	color: #495057;
	background: white;
	padding: 1px 3px;
	border-radius: 2px;
	border: 1px solid #dee2e6;
	min-width: 24px;
	text-align: center;
	box-shadow: 0 1px 1px rgba(0,0,0,0.1);
}

.baza-saved-match-bet {
	grid-area: bet;
	justify-self: center;
}

.baza-bet-input {
	width: 100%;
	padding: 2px 4px;
	border: 1px solid #ddd;
	border-radius: 3px;
	font-size: 10px;
	box-sizing: border-box;
}

.baza-bet-input:focus {
	outline: none;
	border-color: #007bff;
	box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.baza-bet-result {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 6px;
	padding: 4px 8px;
	background: #f8f9fa;
	border-radius: 4px;
	border: 1px solid #e9ecef;
}

.baza-bet-result-label {
	font-size: 10px;
	color: #6c757d;
	font-weight: 500;
	white-space: nowrap;
}

.baza-bet-result-input {
	width: 100%;
	padding: 2px 4px;
	border: 1px solid #ddd;
	border-radius: 3px;
	font-size: 10px;
	box-sizing: border-box;
}

.baza-bet-result-input:focus {
	outline: none;
	border-color: #007bff;
	box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.baza-saved-match-actions {
	grid-area: actions;
	display: flex;
	flex-direction: column;
	gap: 4px;
	justify-self: end;
	align-self: start;
}

.baza-apply-btn {
	background: #28a745;
	color: white;
	border: none;
	border-radius: 3px;
	padding: 2px 6px;
	cursor: pointer;
	font-size: 9px;
	font-weight: 500;
	width: 100%;
}

.baza-apply-btn:hover {
	background: #218838;
}

.baza-delete-btn {
	background: #dc3545;
	color: white;
	border: none;
	border-radius: 3px;
	padding: 2px 6px;
	cursor: pointer;
	font-size: 9px;
	font-weight: 500;
	width: 100%;
}

.baza-delete-btn:hover {
	background: #c82333;
}

.baza-find-match-btn {
	background: #17a2b8;
	color: white;
	border: none;
	border-radius: 3px;
	padding: 2px 6px;
	cursor: pointer;
	font-size: 9px;
	font-weight: 500;
	width: 100%;
}

.baza-find-match-btn:hover {
	background: #138496;
}

.baza-import-btn {
	background: #6f42c1;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 8px 16px;
	cursor: pointer;
	font-size: 14px;
	font-weight: 500;
}

.baza-import-btn:hover {
	background: #5a32a3;
}

.baza-export-btn {
	background: #17a2b8;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 8px 16px;
	cursor: pointer;
	font-size: 14px;
	font-weight: 500;
}

.baza-export-btn:hover {
	background: #138496;
}

.baza-open-modal-btn {
	position: fixed;
	bottom: 20px;
	right: 20px;
	background: #007bff;
	color: white;
	border: none;
	border-radius: 50%;
	width: 50px;
	height: 50px;
	cursor: pointer;
	font-size: 18px;
	z-index: 999;
	box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.baza-open-modal-btn:hover {
	background: #0056b3;
}

.baza-download-dataset-btn {
	position: fixed;
	bottom: 20px;
	left: 20px;
	background: #28a745;
	color: white;
	border: none;
	border-radius: 50%;
	width: 50px;
	height: 50px;
	cursor: pointer;
	font-size: 18px;
	z-index: 999;
	box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.baza-download-dataset-btn:hover {
	background: #218838;
}
`;
document.head.appendChild(style);

// === Конфигурация полей ===
const map = {
	"wd": 0, "league": 1, "date": 2, "score": 3, "half1": 4,
	"teams": 5, "p1": 6, "x": 7, "p2": 8, "f10": 9, "f20": 10,
	"1zab": 11, "2zab": 12, "tb25": 13, "tm25": 14, "Over_3": 15,
	"Under_3": 16, "BTTSyes": 17, "BTTSno": 18,
};

// Обратное отображение индексов на названия колонок
const reverseMap = {};
Object.entries(map).forEach(([key, index]) => {
	reverseMap[index] = key;
});

// Русские названия для колонок
const russianNames = {
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

// Поля, которые НЕ показывать в мини-таблице фильтров
const excludeFromFilters = new Set([
	"wd", "league", "date", "score", "half1", "teams"
]);

// === Унифицированные модели ===
const models = [
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
			{key: 'f10', transform: v => ''},
			{key: 'f20', transform: v => ''},
			{key: '1zab', transform: v => ''},
			{key: '2zab', transform: v => ''},
			{key: 'tb25', transform: v => ''},
			{key: 'tm25', transform: v => ''},
			{key: 'Over_3', transform: v => ''},
			{key: 'Under_3', transform: v => ''},
			{key: 'BTTSyes', transform: v => ''},
			{key: 'BTTSno', transform: v => ''}
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

// === Utils ===
const truncate = (value, digits) => {
	const [intPart, fracPart = ''] = value.split('.');
	if (digits == null || digits <= 0) return intPart + '.';
	return intPart + '.' + fracPart.slice(0, digits).padEnd(digits, '0');
};

const applyModel = (model, cells, inputs) => {
	model.fields.forEach(({key, transform}) => {
		const idx = map[key];
		const cell = cells[idx];
		const input = inputs[idx];
		input.value = transform(cell.innerText);
		input.dispatchEvent(new Event("change", {bubbles: true}));
	});
};

// === Функции для работы с localStorage ===
const saveMatch = (cells) => {
	// Получаем значения из всех инпутов
	const inputs = document.querySelectorAll("tfoot input");
	const inputValues = {};

	// Сохраняем значения инпутов по их индексам
	inputs.forEach((input, index) => {
		inputValues[`filter_${index}`] = input.value;
	});

	const newMatchData = {
		id: Date.now(),
		timestamp: new Date().toISOString(),
		league: cells[map.league]?.innerText,
		date: cells[map.date]?.innerText,
		teams: cells[map.teams]?.innerText,
		score: cells[map.score]?.innerText,
		p1: cells[map.p1]?.innerText,
		x: cells[map.x]?.innerText,
		p2: cells[map.p2]?.innerText,
		f10: cells[map.f10]?.innerText,
		f20: cells[map.f20]?.innerText,
		'1zab': cells[map['1zab']]?.innerText,
		'2zab': cells[map['2zab']]?.innerText,
		tb25: cells[map.tb25]?.innerText,
		tm25: cells[map.tm25]?.innerText,
		Over_3: cells[map.Over_3]?.innerText,
		Under_3: cells[map.Under_3]?.innerText,
		BTTSyes: cells[map.BTTSyes]?.innerText,
		BTTSno: cells[map.BTTSno]?.innerText,
		filterValues: inputValues
	};

	const savedMatches = JSON.parse(localStorage.getItem('baza_saved_matches') || '[]');

	// Проверяем, существует ли уже матч с такими же командами и датой
	const existingMatchIndex = savedMatches.findIndex(match =>
		match.teams === newMatchData.teams &&
		match.date === newMatchData.date
	);

	if (existingMatchIndex !== -1) {
		// Сохраняем существующие данные (ставку, результат, ID)
		const existingMatch = savedMatches[existingMatchIndex];
		newMatchData.id = existingMatch.id;
		newMatchData.bet = existingMatch.bet || '';
		newMatchData.betResult = existingMatch.betResult || '';

		// Обновляем только параметры фильтров, остальное оставляем как есть
		savedMatches[existingMatchIndex].filterValues = newMatchData.filterValues;
		showNotification('Фильтры обновлены!');
	} else {
		// Добавляем новый матч
		savedMatches.push(newMatchData);
		showNotification('Матч сохранен!');
	}

	localStorage.setItem('baza_saved_matches', JSON.stringify(savedMatches));
};

const getSavedMatches = () => {
	return JSON.parse(localStorage.getItem('baza_saved_matches') || '[]');
};

const deleteSavedMatch = (id) => {
	const savedMatches = getSavedMatches();
	const filteredMatches = savedMatches.filter(match => match.id !== id);
	localStorage.setItem('baza_saved_matches', JSON.stringify(filteredMatches));

	// Определяем текущий активный таб
	const activeTabBtn = document.querySelector('.baza-tab-btn.baza-tab-active');
	const activeTab = activeTabBtn ? activeTabBtn.dataset.tab : 'today';

	updateModalContent(activeTab);
};

const applySavedMatch = (id) => {
	const savedMatches = getSavedMatches();
	const match = savedMatches.find(m => m.id === id);

	if (!match || !match.filterValues) return;

	const inputs = document.querySelectorAll("tfoot input");

	// Применяем сохраненные значения к инпутам
	inputs.forEach((input, index) => {
		const savedValue = match.filterValues[`filter_${index}`];
		if (savedValue !== undefined) {
			input.value = savedValue;
			input.dispatchEvent(new Event("change", {bubbles: true}));
		}
	});

	// Показываем уведомление
	showNotification('Значения применены!');

	// Закрываем модальное окно
	if (modal) {
		modal.style.display = 'none';
	}
};

const exportSavedMatches = () => {
	const savedMatches = getSavedMatches();

	if (savedMatches.length === 0) {
		showNotification('Нет сохраненных матчей для экспорта');
		return;
	}

	// Создаем JSON файл
	const dataStr = JSON.stringify(savedMatches, null, 2);
	const dataBlob = new Blob([dataStr], {type: 'application/json'});

	// Создаем ссылку для скачивания
	const link = document.createElement('a');
	link.href = URL.createObjectURL(dataBlob);
	link.download = `saved-matches-${new Date().toISOString().split('T')[0]}.json`;

	// Скачиваем файл
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Освобождаем память
	URL.revokeObjectURL(link.href);

	showNotification('Экспорт завершен!');
};

const saveBetValue = (matchId, betValue) => {
	const savedMatches = getSavedMatches();
	const matchIndex = savedMatches.findIndex(m => m.id === matchId);

	if (matchIndex !== -1) {
		savedMatches[matchIndex].bet = betValue;
		localStorage.setItem('baza_saved_matches', JSON.stringify(savedMatches));
	}
};

const saveBetResult = (matchId, betResult) => {
	const savedMatches = getSavedMatches();
	const matchIndex = savedMatches.findIndex(m => m.id === matchId);

	if (matchIndex !== -1) {
		savedMatches[matchIndex].betResult = betResult;
		localStorage.setItem('baza_saved_matches', JSON.stringify(savedMatches));

		// Обновляем класс карточки для подсветки
		const matchElement = document.querySelector(`[data-match-id="${matchId}"]`);
		if (matchElement) {
			matchElement.className = 'baza-saved-match';
			if (betResult === 'won') {
				matchElement.classList.add('bet-won');
			} else if (betResult === 'lost') {
				matchElement.classList.add('bet-lost');
			}
		}
	}
};

const saveScoreValue = (matchId, scoreValue) => {
	const savedMatches = getSavedMatches();
	const matchIndex = savedMatches.findIndex(m => m.id === matchId);

	if (matchIndex !== -1) {
		savedMatches[matchIndex].score = scoreValue;
		localStorage.setItem('baza_saved_matches', JSON.stringify(savedMatches));
		console.log(`📊 Сохранен счет для матча ${matchId}: ${scoreValue}`);
	}
};

// Функция для парсинга времени начала матча
const parseMatchTime = (dateStr) => {
	if (!dateStr || !dateStr.includes(' ')) return 0;

	const timePart = dateStr.split(' ')[1]; // "17:00"
	const [hours, minutes] = timePart.split(':').map(Number);

	// Возвращаем время в минутах от начала дня для сортировки
	return hours * 60 + minutes;
};

// Функция для парсинга даты матча
const parseMatchDate = (dateStr) => {
	if (!dateStr || !dateStr.includes(' ')) return 0;

	const datePart = dateStr.split(' ')[0]; // "30.08.25"
	const dateParts = datePart.split('.');
	if (dateParts.length === 3) {
		const year = 2000 + parseInt(dateParts[2]);
		const month = parseInt(dateParts[1]) - 1;
		const day = parseInt(dateParts[0]);

		const date = new Date(year, month, day);
		return date.getTime();
	}
	return 0;
};

// Функция для форматирования даты матча для отображения
const formatMatchDate = (dateStr) => {
	if (!dateStr || !dateStr.includes(' ')) return 'Неизвестная дата';

	const datePart = dateStr.split(' ')[0]; // "30.08.25"
	const timePart = dateStr.split(' ')[1]; // "17:00"

	const dateParts = datePart.split('.');
	if (dateParts.length === 3) {
		const year = 2000 + parseInt(dateParts[2]);
		const month = parseInt(dateParts[1]) - 1;
		const day = parseInt(dateParts[0]);

		const date = new Date(year, month, day);
		const time = timePart || '';

		return date.toLocaleString('ru-RU', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		}) + (time ? `, ${time}` : '');
	}
	return dateStr;
};

// Функция для форматирования даты и времени матча для отображения в группах
const formatMatchDateWithTime = (dateStr) => {
	if (!dateStr || !dateStr.includes(' ')) return 'Неизвестная дата';

	const datePart = dateStr.split(' ')[0]; // "30.08.25"
	const timePart = dateStr.split(' ')[1]; // "17:00"

	const dateParts = datePart.split('.');
	if (dateParts.length === 3) {
		const year = 2000 + parseInt(dateParts[2]);
		const month = parseInt(dateParts[1]) - 1;
		const day = parseInt(dateParts[0]);

		const date = new Date(year, month, day);

		// Форматируем дату
		const formattedDate = date.toLocaleString('ru-RU', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});

		// Добавляем время из строки
		return `${formattedDate}, ${timePart}`;
	}
	return dateStr;
};

const importSavedMatches = () => {
	// Создаем скрытый input для выбора файла
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = '.json';
	fileInput.style.display = 'none';

	fileInput.addEventListener('change', (e) => {
		const file = e.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const importedData = JSON.parse(event.target.result);

				if (!Array.isArray(importedData)) {
					throw new Error('Файл должен содержать массив матчей');
				}

				// Проверяем структуру данных
				const isValidData = importedData.every(match =>
					match.id && match.teams && match.timestamp
				);

				if (!isValidData) {
					throw new Error('Неверная структура данных в файле');
				}

				// Получаем существующие матчи
				const existingMatches = getSavedMatches();

				// Объединяем с импортированными, избегая дубликатов по ID
				const existingIds = new Set(existingMatches.map(m => m.id));
				const newMatches = importedData.filter(match => !existingIds.has(match.id));

				if (newMatches.length === 0) {
					showNotification('Все матчи уже существуют в базе');
					return;
				}

				// Сохраняем объединенные данные
				const allMatches = [...existingMatches, ...newMatches];
				localStorage.setItem('baza_saved_matches', JSON.stringify(allMatches));

				// Обновляем содержимое модального окна
				updateModalContent('today');

				showNotification(`Импортировано ${newMatches.length} новых матчей`);

			} catch (error) {
				console.error('Ошибка при импорте:', error);
				showNotification('Ошибка импорта: ' + error.message);
			}
		};

		reader.readAsText(file);
	});

	// Запускаем выбор файла
	document.body.appendChild(fileInput);
	fileInput.click();

	// Удаляем input после использования
	setTimeout(() => {
		document.body.removeChild(fileInput);
	}, 1000);
};
const downloadDataset = async () => {
	try {
		showNotification('Загружаем датасет...');

		const url = 'https://bet-baza.com/main/getdata';

		// Параметры точно как в DataTables
		const params = new URLSearchParams({
			type: '1',
			_: Date.now() // Текущий timestamp
		});

		const fullUrl = `${url}?${params.toString()}`;

		const res = await fetch(fullUrl, {
			method: 'GET',
			headers: {
				'accept': 'application/json, text/javascript, */*; q=0.01',
				'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
				'dnt': '1',
				'priority': 'u=1, i',
				'referer': 'https://bet-baza.com/main/total',
				'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': '"macOS"',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
				'x-requested-with': 'XMLHttpRequest'
			},
			referrer: 'https://bet-baza.com/main/total',
			body: null,
			mode: 'cors',
			credentials: 'include'
		});

		if (!res.ok) {
			throw new Error(`HTTP ошибка: ${res.status} ${res.statusText}`);
		}

		const json = await res.json();

		// Сохраняем ответ в файл
		const blob = new Blob([JSON.stringify(json)], { type: "application/json;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "dataset.json";
		a.click();

		showNotification('Датасет успешно скачан!');
		console.log("Файл успешно сохранён ✅");

	} catch (err) {
		console.error("Ошибка при запросе или сохранении:", err);
		showNotification('Ошибка: ' + err.message);
	}
};


// === Уведомления ===
const showNotification = (message) => {
	const notification = document.createElement('div');
	notification.textContent = message;
	notification.style.cssText = `
		position: fixed;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		background: #28a745;
		color: white;
		padding: 10px 20px;
		border-radius: 4px;
		z-index: 1001;
		font-size: 14px;
	`;
	document.body.appendChild(notification);

	setTimeout(() => {
		notification.remove();
	}, 2000);
};

// === Модальное окно ===
let modal = null;

const createModal = () => {
	if (modal) return modal;

	modal = document.createElement('div');
	modal.className = 'baza-modal';
	modal.innerHTML = `
		<div class="baza-modal-content">
			<div class="baza-modal-header">
				<h2>Сохраненные матчи</h2>
				<div class="baza-modal-actions">
					<button class="baza-import-btn">Import JSON</button>
					<button class="baza-export-btn">Export as JSON</button>
					<span class="baza-modal-close">&times;</span>
				</div>
			</div>
			<div class="baza-modal-tabs">
				<button class="baza-tab-btn baza-tab-active" data-tab="today">Today</button>
				<button class="baza-tab-btn" data-tab="history">History</button>
			</div>
			<div id="baza-saved-matches-container"></div>
		</div>
	`;

	document.body.appendChild(modal);

	// Закрытие по клику на крестик
	modal.querySelector('.baza-modal-close').addEventListener('click', () => {
		modal.style.display = 'none';
	});

	// Закрытие по клику вне модального окна
	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			modal.style.display = 'none';
		}
	});

	// Обработчик для кнопок экспорта и импорта
	modal.addEventListener('click', (e) => {
		if (e.target.classList.contains('baza-export-btn')) {
			exportSavedMatches();
		} else if (e.target.classList.contains('baza-import-btn')) {
			importSavedMatches();
		}
	});

	// Обработчики для табов
	modal.addEventListener('click', (e) => {
		if (e.target.classList.contains('baza-tab-btn')) {
			// Убираем активный класс у всех табов
			modal.querySelectorAll('.baza-tab-btn').forEach(btn => {
				btn.classList.remove('baza-tab-active');
			});

			// Добавляем активный класс к нажатому табу
			e.target.classList.add('baza-tab-active');

			// Обновляем содержимое в зависимости от выбранного таба
			const activeTab = e.target.dataset.tab;

			// Сохраняем активный таб в localStorage
			localStorage.setItem('baza_last_active_tab', activeTab);

			updateModalContent(activeTab);
		}
	});

	return modal;
};

const updateModalContent = (activeTab = 'today') => {
	const container = document.getElementById('baza-saved-matches-container');
	if (!container) return;

	const savedMatches = getSavedMatches();

	if (savedMatches.length === 0) {
		container.innerHTML = '<p>Нет сохраненных матчей</p>';
		return;
	}

	// Разделяем матчи на today и history по дате МАТЧА, а не по времени сохранения
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const todayMatches = [];
	const historyMatches = [];

	savedMatches.forEach(match => {
		// Парсим дату матча из поля date (например: "30.08.25 17:00")
		const matchDateStr = match.date;
		if (!matchDateStr) {
			// Если нет даты матча, используем время сохранения
			const saveDate = new Date(match.timestamp);
			saveDate.setHours(0, 0, 0, 0);
			if (saveDate.getTime() === today.getTime()) {
				todayMatches.push(match);
			} else {
				historyMatches.push(match);
			}
			return;
		}

		// Парсим дату матча (формат: "DD.MM.YY HH:MM")
		const dateParts = matchDateStr.split(' ')[0].split('.');
		if (dateParts.length === 3) {
			const matchYear = 2000 + parseInt(dateParts[2]);
			const matchMonth = parseInt(dateParts[1]) - 1;
			const matchDay = parseInt(dateParts[0]);

			const matchDate = new Date(matchYear, matchMonth, matchDay);
			matchDate.setHours(0, 0, 0, 0);

			// Проверяем, прошедшая ли это дата
			if (matchDate < today) {
				// Прошедшая дата - отправляем в History
				historyMatches.push(match);
			} else if (matchDate.getTime() === today.getTime()) {
				// Сегодняшняя дата - отправляем в Today
				todayMatches.push(match);
			} else {
				// Будущая дата - отправляем в Today
				todayMatches.push(match);
			}
		} else {
			// Если не удалось распарсить, используем время сохранения
			const saveDate = new Date(match.timestamp);
			saveDate.setHours(0, 0, 0, 0);
			if (saveDate.getTime() === today.getTime()) {
				todayMatches.push(match);
			} else {
				historyMatches.push(match);
			}
		}
	});

	// Выбираем матчи для отображения
	const matchesToShow = activeTab === 'today' ? todayMatches : historyMatches;

	if (matchesToShow.length === 0) {
		container.innerHTML = `<p>Нет матчей в секции ${activeTab === 'today' ? 'Today' : 'History'}</p>`;
		return;
	}

	// Группируем матчи по дате и времени (только для today)
	if (activeTab === 'today') {
		// Группируем матчи по дате и времени с разницей до 30 минут
		const groupedMatches = {};
		const timeGroups = [];

		// Сортируем матчи по дате и времени начала матча
		const sortedMatches = [...matchesToShow].sort((a, b) => {
			// Сначала сортируем по дате
			const dateA = parseMatchDate(a.date);
			const dateB = parseMatchDate(b.date);
			if (dateA !== dateB) {
				return dateA - dateB;
			}
			// Если дата одинаковая, сортируем по времени
			const timeA = parseMatchTime(a.date);
			const timeB = parseMatchTime(b.date);
			return timeA - timeB;
		});

		sortedMatches.forEach(match => {
			// Парсим дату и время матча
			const matchDate = parseMatchDate(match.date);
			const matchTime = parseMatchTime(match.date);

			let addedToGroup = false;

			// Ищем подходящую группу по дате и времени (разница не более 30 минут)
			for (let i = 0; i < timeGroups.length; i++) {
				const groupDate = timeGroups[i].matchDate;
				const groupTime = timeGroups[i].matchTime;

				// Если дата одинаковая и разница во времени не более 30 минут
				if (groupDate === matchDate && Math.abs(matchTime - groupTime) <= 30) {
					timeGroups[i].matches.push(match);
					addedToGroup = true;
					break;
				}
			}

			// Если не нашли подходящую группу, создаем новую
			if (!addedToGroup) {
				timeGroups.push({
					timestamp: match.timestamp,
					matchDate: matchDate,
					matchTime: matchTime,
					matches: [match]
				});
			}
		});

		// Формируем ключи для групп
		timeGroups.forEach((group, index) => {
			// Находим самый ранний матч в группе по времени
			const earliestMatch = group.matches.reduce((earliest, current) => {
				const currentTime = parseMatchTime(current.date);
				const earliestTime = parseMatchTime(earliest.date);
				return currentTime < earliestTime ? current : earliest;
			});

			const dateKey = formatMatchDateWithTime(earliestMatch.date);

			groupedMatches[`group_${index}`] = {
				key: dateKey,
				matches: group.matches,
				matchDate: group.matchDate,
				matchTime: group.matchTime
			};
		});

		// Сортируем группы по дате и времени (ранние сначала)
		const sortedTimeKeys = Object.keys(groupedMatches).sort((a, b) => {
			const groupA = groupedMatches[a];
			const groupB = groupedMatches[b];

			// Сначала сортируем по дате
			if (groupA.matchDate !== groupB.matchDate) {
				return groupA.matchDate - groupB.matchDate;
			}
			// Если дата одинаковая, сортируем по времени
			return groupA.matchTime - groupB.matchTime;
		});

		// Формируем HTML с группами
		container.innerHTML = sortedTimeKeys.map(groupKey => {
			const group = groupedMatches[groupKey];
			const matches = group.matches;

			const matchesHTML = matches.map(match => {
				// Формируем строку с сохраненными значениями из инпутов
				let filterValuesStr = '';
				if (match.filterValues) {
					const filterValues = Object.entries(match.filterValues);
					if (filterValues.length > 0) {
						// Сортируем по индексу для правильного порядка
						const sortedFilters = filterValues.sort(([a], [b]) => {
							const indexA = parseInt(a.replace('filter_', ''));
							const indexB = parseInt(b.replace('filter_', ''));
							return indexA - indexB;
						});

						const columnNames = sortedFilters.map(([key]) => {
							const index = parseInt(key.replace('filter_', ''));
							const englishName = reverseMap[index] || key;
							return russianNames[englishName] || englishName;
						}).filter((name, index) => {
							const key = sortedFilters[index][0];
							const indexNum = parseInt(key.replace('filter_', ''));
							const englishName = reverseMap[indexNum] || key;
							return !excludeFromFilters.has(englishName);
						});

						const columnValues = sortedFilters.map(([key, value]) => {
							return value && value.trim() !== '' ? value : '-';
						}).filter((value, index) => {
							const key = sortedFilters[index][0];
							const indexNum = parseInt(key.replace('filter_', ''));
							const englishName = reverseMap[indexNum] || key;
							return !excludeFromFilters.has(englishName);
						});

						filterValuesStr = `
							<div class="baza-filters-table">
								${columnNames.map((name, index) => `
									<div class="baza-filter-item">
										<div class="baza-filter-label">${name}</div>
										<div class="baza-filter-value">${columnValues[index]}</div>
									</div>
								`).join('')}
							</div>
						`;
					}
				}

				return `
				<div class="baza-saved-match ${match.betResult ? (match.betResult === 'won' ? 'bet-won' : 'bet-lost') : ''}" data-match-id="${match.id}">
					<div class="baza-saved-match-info">
						<div class="baza-match-teams">${match.teams}</div>
						<div class="baza-match-league">${match.league} • ${match.date}</div>
						<div class="baza-match-score">
							<span class="baza-score-label">Счет:</span>
							<input type="text" class="baza-score-input" value="${match.score || ''}" data-match-id="${match.id}">
						</div>
					</div>
					${filterValuesStr ? `<div class="baza-match-filters">${filterValuesStr}</div>` : '<div class="baza-match-filters"></div>'}
					<div class="baza-saved-match-bet">
						<input type="text" class="baza-bet-input" placeholder="Вариант ставки" value="${match.bet || ''}" data-match-id="${match.id}">
						<div class="baza-bet-result">
							<span class="baza-bet-result-label">Результат:</span>
							<input type="text" class="baza-bet-result-input" placeholder="won/lost" value="${match.betResult || ''}" data-match-id="${match.id}">
						</div>
					</div>
					<div class="baza-saved-match-actions">
						<button class="baza-apply-btn" data-match-id="${match.id}">Применить фильтр</button>
						<button class="baza-delete-btn" data-match-id="${match.id}">Удалить</button>
					</div>
				</div>
				`;
			}).join('');

			return `
			<div class="baza-time-group">
				<div class="baza-time-group-header">${group.key}</div>
				<div class="baza-time-group-content">
					${matchesHTML}
				</div>
			</div>
			`;
		}).join('');
	} else {
		// Для history сортируем матчи по времени начала и показываем без группировки
		const sortedHistoryMatches = [...matchesToShow].sort((a, b) => {
			const timeA = parseMatchTime(a.date);
			const timeB = parseMatchTime(b.date);
			return timeA - timeB; // сортируем по возрастанию времени
		});

		container.innerHTML = sortedHistoryMatches.map(match => {
			// Формируем строку с сохраненными значениями из инпутов
			let filterValuesStr = '';
			if (match.filterValues) {
				const filterValues = Object.entries(match.filterValues);
				if (filterValues.length > 0) {
					// Сортируем по индексу для правильного порядка
					const sortedFilters = filterValues.sort(([a], [b]) => {
						const indexA = parseInt(a.replace('filter_', ''));
						const indexB = parseInt(b.replace('filter_', ''));
						return indexA - indexB;
					});

					const columnNames = sortedFilters.map(([key]) => {
						const index = parseInt(key.replace('filter_', ''));
						const englishName = reverseMap[index] || key;
						return russianNames[englishName] || englishName;
					}).filter((name, index) => {
						const key = sortedFilters[index][0];
						const indexNum = parseInt(key.replace('filter_', ''));
						const englishName = reverseMap[indexNum] || key;
						return !excludeFromFilters.has(englishName);
					});

					const columnValues = sortedFilters.map(([key, value]) => {
						return value && value.trim() !== '' ? value : '-';
					}).filter((value, index) => {
						const key = sortedFilters[index][0];
						const indexNum = parseInt(key.replace('filter_', ''));
						const englishName = reverseMap[indexNum] || key;
						return !excludeFromFilters.has(englishName);
					});

					filterValuesStr = `
						<div class="baza-filters-table">
							${columnNames.map((name, index) => `
								<div class="baza-filter-item">
									<div class="baza-filter-label">${name}</div>
									<div class="baza-filter-value">${columnValues[index]}</div>
								</div>
							`).join('')}
						</div>
					`;
				}
			}

			return `
			<div class="baza-saved-match ${match.betResult ? (match.betResult === 'won' ? 'bet-won' : 'bet-lost') : ''}" data-match-id="${match.id}">
				<div class="baza-saved-match-info">
					<div class="baza-match-teams">${match.teams}</div>
					<div class="baza-match-league">${match.league} • ${match.date}</div>
					<div class="baza-match-score">
						<span class="baza-score-label">Счет:</span>
						<input type="text" class="baza-score-input" placeholder="0-0" value="${match.score || ''}" data-match-id="${match.id}">
					</div>
				</div>
				${filterValuesStr ? `<div class="baza-match-filters">${filterValuesStr}</div>` : '<div class="baza-match-filters"></div>'}
				<div class="baza-saved-match-bet">
					<input type="text" class="baza-bet-input" placeholder="Вариант ставки" value="${match.bet || ''}" data-match-id="${match.id}">
					<div class="baza-bet-result">
						<span class="baza-bet-result-label">Результат:</span>
						<input type="text" class="baza-bet-result-input" placeholder="won/lost" value="${match.betResult || ''}" data-match-id="${match.id}">
					</div>
				</div>
				<div class="baza-saved-match-actions">
					<button class="baza-apply-btn" data-match-id="${match.id}">Применить</button>
					<button class="baza-delete-btn" data-match-id="${match.id}">Удалить</button>
				</div>
			</div>
			`;
		}).join('');
	}

	// Добавляем обработчики событий для кнопок
	container.addEventListener('click', (e) => {
		if (e.target.classList.contains('baza-delete-btn')) {
			const matchId = parseInt(e.target.dataset.matchId);
			deleteSavedMatch(matchId);
		} else if (e.target.classList.contains('baza-apply-btn')) {
			const matchId = parseInt(e.target.dataset.matchId);
			applySavedMatch(matchId);
		} else if (e.target.classList.contains('baza-analysis-marker')) {
			const matchId = parseInt(e.target.dataset.matchId);
			toggleAnalysisStatus(matchId);
		}
	});

	// Добавляем обработчики для полей ставок, результатов и счета
	container.addEventListener('input', (e) => {
		if (e.target.classList.contains('baza-bet-input')) {
			const matchId = parseInt(e.target.dataset.matchId);
			const betValue = e.target.value;
			saveBetValue(matchId, betValue);
		} else if (e.target.classList.contains('baza-bet-result-input')) {
			const matchId = parseInt(e.target.dataset.matchId);
			const betResult = e.target.value;
			saveBetResult(matchId, betResult);
		} else if (e.target.classList.contains('baza-score-input')) {
			const matchId = parseInt(e.target.dataset.matchId);
			const scoreValue = e.target.value;
			saveScoreValue(matchId, scoreValue);
		}
	});
};

const toggleRowHighlight = (row) => {
	const isHighlighted = row.classList.toggle('baza-row-highlighted');

	// Обновляем состояние кнопки-маркера
	updateMarkerButton(row, isHighlighted);

	// Обновляем список отмеченных страниц
	updateMarkedPages(isHighlighted);
};

const updateMarkerButton = (row, isHighlighted) => {
	const marker = row.querySelector('.baza-row-marker');
	if (!marker) return;

	marker.classList.toggle('active', isHighlighted);
	marker.innerHTML = isHighlighted ? '✅' : '✏️';
	marker.title = isHighlighted ? 'Строка подсвечена' : 'Подсветить строку';
};

const updateMarkedPages = (isHighlighted) => {
	const currentPage = getCurrentPageNumber();
	if (!currentPage) return;

	let markedPages = getMarkedPagesFromStorage();

	if (isHighlighted) {
		// Добавляем страницу если её нет
		if (!markedPages.includes(currentPage)) {
			markedPages.push(currentPage);
		}
	} else {
		// Удаляем страницу если убираем маркер
		markedPages = markedPages.filter(page => page !== currentPage);
	}

	saveMarkedPagesToStorage(markedPages);
	updateMarkedPagination();
};

// Вспомогательные функции для работы с пагинацией
const getCurrentPageNumber = () => {
	const activePageBtn = document.querySelector('.paginate_button.current');
	return activePageBtn ? parseInt(activePageBtn.textContent) : null;
};

const getMarkedPagesFromStorage = () => {
	return JSON.parse(localStorage.getItem('baza_marked_pages') || '[]');
};

const saveMarkedPagesToStorage = (pages) => {
	localStorage.setItem('baza_marked_pages', JSON.stringify(pages));
};

// Простая функция восстановления подсвеченных строк
const restoreHighlightedRows = () => {
	// Пока ничего не восстанавливаем - только для совместимости
};

const restoreCurrentPage = () => {
	const savedPage = localStorage.getItem('baza_current_page');
	if (!savedPage) return;

	const pageNumber = parseInt(savedPage);
	const targetButton = findPageButton(pageNumber);

	if (targetButton && !targetButton.classList.contains('current')) {
		targetButton.click();
	}
};

const getMarkedPages = () => {
	return getMarkedPagesFromStorage().sort((a, b) => a - b);
};



const updateMarkedPagination = () => {
	const markedPages = getMarkedPages();
	const container = getOrCreatePaginationContainer();
	const pagesContainer = container.querySelector('.baza-marked-pagination-pages');

	renderPaginationPages(pagesContainer, markedPages);
};

const getOrCreatePaginationContainer = () => {
	let container = document.querySelector('.baza-marked-pagination');

	if (!container) {
		container = createPaginationContainer();
		insertAfterTable(container);
		addClearButtonListener(container);
	}

	return container;
};

const createPaginationContainer = () => {
	const container = document.createElement('div');
	container.className = 'baza-marked-pagination';
	container.innerHTML = `
		<div class="baza-marked-pagination-title">ToDo:</div>
		<div class="baza-marked-pagination-pages"></div>
		<button class="baza-clear-marked-pages-btn" title="Очистить все отмеченные страницы">🗑️</button>
	`;
	return container;
};

const insertAfterTable = (container) => {
	const table = document.querySelector('#example');
	if (table) {
		table.parentNode.insertBefore(container, table.nextSibling);
	}
};

const addClearButtonListener = (container) => {
	const clearBtn = container.querySelector('.baza-clear-marked-pages-btn');
	if (clearBtn) {
		clearBtn.addEventListener('click', clearAllMarkedPages);
	}
};

const clearAllMarkedPages = () => {
	// Очищаем localStorage
	localStorage.removeItem('baza_marked_pages');

	// Убираем подсветку со всех строк
	document.querySelectorAll('.baza-row-highlighted').forEach(row => {
		row.classList.remove('baza-row-highlighted');
		updateMarkerButton(row, false);
	});

	// Обновляем пагинацию
	updateMarkedPagination();

	console.log('🗑️ Все отмеченные страницы очищены');
};

const renderPaginationPages = (pagesContainer, markedPages) => {
	if (!pagesContainer) return;

	if (markedPages.length === 0) {
		pagesContainer.innerHTML = '<span style="color: #6c757d; font-style: italic;">Нет отмеченных матчей</span>';
	} else {
		pagesContainer.innerHTML = createPageButtons(markedPages);
		addPageButtonListeners(pagesContainer);
	}
};

const createPageButtons = (pages) => {
	return pages.map(pageNum =>
		`<button class="baza-marked-page-btn" data-page="${pageNum}">${pageNum}</button>`
	).join('');
};

const addPageButtonListeners = (container) => {
	container.querySelectorAll('.baza-marked-page-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			goToMarkedPage(parseInt(btn.dataset.page));
		});
	});
};

const saveCurrentPage = () => {
	const pageNumber = getCurrentPageNumber();
	if (pageNumber) {
		localStorage.setItem('baza_current_page', pageNumber.toString());
	}
};

const goToMarkedPage = (pageNum) => {
	console.log(`🔄 Переходим на страницу ${pageNum}`);

	// Используем API DataTables для перехода на страницу
	const table = $('#example').DataTable();
	if (table) {
		// DataTables использует индексацию с 0, поэтому вычитаем 1
		const pageIndex = pageNum - 1;
		console.log(`📊 Переходим на страницу ${pageNum} (индекс: ${pageIndex})`);
		table.page(pageIndex).draw('page');
		console.log(`✅ Переход на страницу ${pageNum} выполнен`);
	} else {
		console.log(`❌ Таблица DataTables не найдена`);
	}
};

const findPageButton = (pageNum) => {
	// Ищем кнопки пагинации DataTables разными способами
	let pageButtons = document.querySelectorAll('.paginate_button');

	// Если не нашли, пробуем другие селекторы
	if (pageButtons.length === 0) {
		pageButtons = document.querySelectorAll('.dataTables_paginate .paginate_button');
	}
	if (pageButtons.length === 0) {
		pageButtons = document.querySelectorAll('[class*="paginate"]');
	}

	console.log(`🔍 Ищем кнопку страницы ${pageNum} среди ${pageButtons.length} кнопок`);

	// Выводим все найденные кнопки для отладки
	pageButtons.forEach((btn, index) => {
		console.log(`   Кнопка ${index}: текст="${btn.textContent.trim()}", классы="${btn.className}"`);
	});

	// Ищем по тексту (обычно это номер страницы)
	const foundButton = Array.from(pageButtons).find(btn =>
		btn.textContent.trim() === pageNum.toString()
	);

	if (foundButton) {
		console.log(`✅ Найдена кнопка:`, foundButton);
	} else {
		console.log(`❌ Кнопка не найдена`);
	}

	return foundButton;
};

const setupPageChangeListener = () => {
	const paginationContainer = document.querySelector('.dataTables_paginate');
	if (!paginationContainer) return;

	paginationContainer.addEventListener('click', handlePaginationClick);
};

const handlePaginationClick = (e) => {
	if (e.target.classList.contains('paginate_button')) {
		setTimeout(saveCurrentPage, 100);
	}
};

const showModal = () => {
	const modal = createModal();

	// Восстанавливаем последний активный таб или используем 'today' по умолчанию
	const lastActiveTab = localStorage.getItem('baza_last_active_tab') || 'today';

	// Обновляем активный таб в интерфейсе
	modal.querySelectorAll('.baza-tab-btn').forEach(btn => {
		btn.classList.remove('baza-tab-active');
		if (btn.dataset.tab === lastActiveTab) {
			btn.classList.add('baza-tab-active');
		}
	});

	updateModalContent(lastActiveTab);
	modal.style.display = 'block';
};

// === Создание кнопки открытия модального окна ===
const createOpenModalButton = () => {
	if (document.querySelector('.baza-open-modal-btn')) return;

	const btn = document.createElement('button');
	btn.className = 'baza-open-modal-btn';
	btn.innerHTML = '📋';
	btn.title = 'Сохраненные матчи';
	btn.addEventListener('click', showModal);

	document.body.appendChild(btn);

	// Создаем кнопку скачивания датасета
	const downloadBtn = document.createElement('button');
	downloadBtn.className = 'baza-download-dataset-btn';
	downloadBtn.innerHTML = '📊';
	downloadBtn.title = 'Скачать датасет';
	downloadBtn.addEventListener('click', downloadDataset);

	document.body.appendChild(downloadBtn);
};

const createButtons = (tr) => {
	if (tr.querySelector(".baza-btn")) return;

	const buttonCell = createButtonCell();
	const buttonContainer = createButtonContainer();

	addModelButtons(buttonContainer, tr);
	addSaveButton(buttonContainer, tr);
	addMarkerButton(buttonContainer, tr);

	buttonCell.appendChild(buttonContainer);
	tr.appendChild(buttonCell);
};

const createButtonCell = () => {
	const cell = document.createElement("td");
	cell.style.cssText = "padding: 4px; text-align: center; min-width: 120px; border: 1px solid #ddd;";
	return cell;
};

const createButtonContainer = () => {
	const container = document.createElement("div");
	container.style.cssText = "display: flex; gap: 2px; justify-content: center;";
	return container;
};

const addModelButtons = (container, tr) => {
	const cells = tr.querySelectorAll("td");
	const inputs = document.querySelectorAll("tfoot input");

	models.forEach(model => {
		const btn = createModelButton(model, cells, inputs);
		container.appendChild(btn);
	});
};

const createModelButton = (model, cells, inputs) => {
	const btn = document.createElement("button");
	btn.textContent = model.btnText;
	btn.style.cssText = `background-color: ${model.color}; color: white;`;
	btn.title = model.label;

	btn.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		applyModel(model, cells, inputs);
	});

	return btn;
};

const addSaveButton = (container, tr) => {
	// Добавляем разделитель между группами кнопок
	const separator = document.createElement("div");
	separator.style.cssText = "width: 8px; height: 1px; background: #ddd; margin: 0 4px;";

	const saveBtn = document.createElement("button");
	saveBtn.innerHTML = "💾";
	saveBtn.className = "baza-btn baza-btn--save";
	saveBtn.title = "Сохранить матч";

	saveBtn.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		saveMatch(tr.querySelectorAll("td"));
	});

	container.appendChild(separator);
	container.appendChild(saveBtn);
};

const addMarkerButton = (container, tr) => {
	const markerBtn = document.createElement("button");
	markerBtn.innerHTML = "✏️";
	markerBtn.className = "baza-row-marker";
	markerBtn.title = "Подсветить строку";

	markerBtn.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		toggleRowHighlight(tr);
	});

	container.appendChild(markerBtn);
};

const setup = () => {
	document.querySelectorAll("#example tbody tr").forEach(createButtons);
	createOpenModalButton();
	updateMarkedPagination();
	setupPageChangeListener();
};

// Наблюдатель за изменениями DOM
new MutationObserver(() => setup()).observe(
	document.querySelector("#example"),
	{childList: true, subtree: true}
);

// Восстанавливаем страницу только при первой загрузке
document.addEventListener('DOMContentLoaded', () => {
	// Небольшая задержка для полной загрузки таблицы
	setTimeout(() => {
		restoreCurrentPage();
	}, 500);
});
