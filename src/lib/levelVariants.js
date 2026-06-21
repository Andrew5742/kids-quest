const ROBOT_GAME_ID = '10000000-0000-4000-8000-000000000001';
const DIGITAL_GAME_ID = '20000000-0000-4000-8000-000000000002';
const SCRATCH_GAME_ID = '30000000-0000-4000-8000-000000000003';

const robotMissionNames = [
  'Енергоміст', 'Антенна на даху', 'Лабіринт деталей', 'Рятувальний маяк', 'Склад батарей',
  'Метеостанція', 'Місячний модуль', 'Пошта RoboCity', 'Оранжерея датчиків', 'Підземний тунель',
  'Порт механіків', 'Світлофорний збій', 'Крижана база', 'Сонячна ферма', 'Музей роботів',
  'Водяна станція', 'Аеродром дронів', 'Шкільна лабораторія', 'Космічний ліфт', 'Парк винахідників',
  'Міст через каньйон', 'Експедиція на Марс', 'Радіовежа', 'Завод шестерень', 'Сховище інструментів',
  'Нічний патруль', 'Фінальний маршрут RoboCity',
];

const robotPairs = [
  [[4, 0], [0, 5]], [[0, 0], [4, 5]], [[4, 5], [0, 0]],
  [[0, 5], [4, 0]], [[2, 0], [4, 5]], [[4, 2], [0, 5]],
  [[0, 3], [4, 0]], [[3, 5], [0, 1]], [[1, 0], [4, 4]],
];

const directionFor = ([fromRow, fromColumn], [toRow, toColumn]) => {
  if (toRow < fromRow) return 'N';
  if (toRow > fromRow) return 'S';
  if (toColumn < fromColumn) return 'W';
  return 'E';
};

function buildPath(start, goal, horizontalFirst) {
  const path = [[...start]];
  let [row, column] = start;
  const moveHorizontal = () => {
    while (column !== goal[1]) {
      column += Math.sign(goal[1] - column);
      path.push([row, column]);
    }
  };
  const moveVertical = () => {
    while (row !== goal[0]) {
      row += Math.sign(goal[0] - row);
      path.push([row, column]);
    }
  };
  if (horizontalFirst) { moveHorizontal(); moveVertical(); }
  else { moveVertical(); moveHorizontal(); }
  return path;
}

function robotRouteVariant(level, index) {
  const [start, goal] = robotPairs[index % robotPairs.length];
  const horizontalFirst = Math.floor(index / robotPairs.length) !== 1;
  const path = buildPath(start, goal, horizontalFirst);
  const itemPosition = path[1 + (index % Math.max(1, path.length - 2))];
  let repairPosition = path[1 + ((index * 2 + 2) % Math.max(1, path.length - 2))];
  if (itemPosition[0] === repairPosition[0] && itemPosition[1] === repairPosition[1]) {
    repairPosition = path[Math.max(1, path.length - 2)];
  }
  const pathKeys = new Set(path.map(([row, column]) => `${row},${column}`));
  const freeCells = [];
  for (let row = 0; row < 5; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      if (!pathKeys.has(`${row},${column}`)) freeCells.push([row, column]);
    }
  }
  const obstacleCount = 2 + (index % 3);
  const obstacles = Array.from({ length: obstacleCount }, (_, offset) => freeCells[(index * 3 + offset * 5) % freeCells.length]);
  const firstStep = path[1] || goal;
  const name = robotMissionNames[index];
  const cargo = ['🔋', '📦', '💎', '🧪', '🌱', '🛰️'][index % 6];
  const repair = ['📡', '🚦', '💡', '⚙️', '🔌', '🛠️'][index % 6];
  return {
    ...level,
    title: `${index + 1}. ${name}`,
    teacher_hint: `Запропонуй дитині спочатку знайти поворот і дві клітинки дії у місії «${name}».`,
    config_json: {
      ...level.config_json,
      storyTitle: name,
      story: `Робот має доставити ${cargo}, полагодити ${repair} і дістатися прапорця. Маршрут цього разу інший.`,
      instruction: 'Склади маршрут, виконай обидві дії на правильних клітинках і лише тоді фінішуй.',
      objectives: [`забрати ${cargo}`, `полагодити ${repair}`, 'дійти до прапорця без зіткнення'],
      maxCommands: 36,
      grid: {
        rows: 5,
        cols: 6,
        start,
        goal,
        dir: directionFor(start, firstStep),
        obstacles,
        items: [{ id: `cargo-${index + 1}`, pos: itemPosition, emoji: cargo }],
        repairs: [{ id: `repair-${index + 1}`, pos: repairPosition, emoji: repair }],
      },
    },
  };
}

const assemblyVariants = [
  ['Марсохід-геолог', ['hub', 'motor', 'sensor'], ['start', 'motor_on', 'wait', 'motor_off']],
  ['Робот-ліхтар', ['hub', 'sensor', 'light'], ['start', 'light_on', 'wait', 'motor_off']],
  ['Вантажний тягач', ['hub', 'motor', 'wheel'], ['start', 'motor_on', 'motor_off']],
  ['Розумна турбіна', ['hub', 'motor', 'gear'], ['start', 'motor_on', 'wait', 'motor_off']],
  ['Сигнальний ровер', ['hub', 'light', 'wheel'], ['start', 'light_on', 'motor_on', 'motor_off']],
  ['Дослідник перешкод', ['hub', 'sensor', 'wheel'], ['start', 'wait', 'motor_on', 'motor_off']],
  ['Механічний кран', ['hub', 'motor', 'gear'], ['start', 'motor_on', 'wait', 'wait', 'motor_off']],
  ['Нічний патруль', ['hub', 'sensor', 'light'], ['start', 'light_on', 'wait', 'light_on', 'motor_off']],
  ['Фінальний RoboBot', ['hub', 'motor', 'sensor', 'wheel'], ['start', 'motor_on', 'wait', 'light_on', 'motor_off']],
];

function robotAssemblyVariant(level, index) {
  const [project, requiredParts, requiredProgram] = assemblyVariants[index];
  return {
    ...level,
    title: `Збірка: ${project}`,
    teacher_hint: `У «${project}» дитина має пояснити призначення кожної вибраної деталі перед запуском.`,
    config_json: { ...level.config_json, project, requiredParts, requiredProgram, instruction: `Збери модель «${project}» і склади її програму в логічному порядку.` },
  };
}

const robotSortSets = [
  ['Підготовка ровера', [['Контролер', 'electronics', '🧠'], ['Датчик нахилу', 'electronics', '📐'], ['Вісь', 'mechanics', '➖'], ['Викрутка', 'tools', '🪛']]],
  ['Ремонт конвеєра', [['Мотор', 'electronics', '⚡'], ['Ремінь', 'mechanics', '🔗'], ['Шестерня', 'mechanics', '⚙️'], ['Ключ', 'tools', '🔧']]],
  ['Експедиційний набір', [['Хаб', 'electronics', '🧠'], ['Колесо', 'mechanics', '🛞'], ['Карта полігону', 'field', '🗺️'], ['Плоскогубці', 'tools', '🗜️']]],
  ['Світлова станція', [['LED-матриця', 'electronics', '💡'], ['Балка', 'mechanics', '📏'], ['Маркер траси', 'field', '🚩'], ['Мультиметр', 'tools', '📟']]],
  ['Фінальний склад', [['Датчик кольору', 'electronics', '🌈'], ['Зубчаста рейка', 'mechanics', '⚙️'], ['Конус поля', 'field', '🔺'], ['Шестигранник', 'tools', '🔩']]],
];

const digitalSortSets = [
  ['Шкільний ноутбук', [['photo_trip.jpg', 'photos', '🖼️'], ['math_homework.pdf', 'study', '📄'], ['cache.tmp', 'trash', '🗑️'], ['free_coins.exe', 'quarantine', '☣️']]],
  ['Фотоекспедиція', [['forest.png', 'photos', '🌲'], ['plants_notes.docx', 'study', '📝'], ['broken_copy.tmp', 'trash', '🗑️'], ['photo_viewer_crack.exe', 'quarantine', '⚠️']]],
  ['Проєкт про космос', [['moon.jpg', 'photos', '🌙'], ['planets.pptx', 'study', '🪐'], ['draft_old.bak', 'trash', '🗑️'], ['space_bonus.scr', 'quarantine', '☣️']]],
  ['Музичний гурток', [['concert.jpg', 'photos', '🎤'], ['music_theory.pdf', 'study', '🎼'], ['empty.tmp', 'trash', '🗑️'], ['new_song.exe', 'quarantine', '⚠️']]],
  ['Робототехніка', [['robot_photo.png', 'photos', '🤖'], ['algorithm.txt', 'study', '📚'], ['test_copy.bak', 'trash', '🗑️'], ['driver_gift.exe', 'quarantine', '☣️']]],
  ['Шкільна газета', [['interview.jpg', 'photos', '📸'], ['article.docx', 'study', '📰'], ['article_old.tmp', 'trash', '🗑️'], ['font_pack.exe', 'quarantine', '⚠️']]],
  ['Домашня бібліотека', [['book_cover.jpg', 'photos', '📕'], ['reading_list.pdf', 'study', '📖'], ['duplicate.tmp', 'trash', '🗑️'], ['ebook_unlocker.exe', 'quarantine', '☣️']]],
  ['Спортивний день', [['team.jpg', 'photos', '🏃'], ['results.xlsx', 'study', '📊'], ['score_old.bak', 'trash', '🗑️'], ['medal_generator.exe', 'quarantine', '⚠️']]],
  ['Мініфільм', [['scene.png', 'photos', '🎬'], ['script.docx', 'study', '📜'], ['render.tmp', 'trash', '🗑️'], ['effects_crack.exe', 'quarantine', '☣️']]],
  ['Чистий робочий стіл', [['family.png', 'photos', '👨‍👩‍👧'], ['final_project.pdf', 'study', '🎓'], ['unused.tmp', 'trash', '🗑️'], ['super_prize.exe', 'quarantine', '⚠️']]],
];

function desktopVariant(level, index) {
  const isRobot = level.game_id === ROBOT_GAME_ID;
  const [scenario, sourceCards] = (isRobot ? robotSortSets : digitalSortSets)[index];
  const cards = sourceCards.map(([title, category, emoji], cardIndex) => ({ id: `card-${index + 1}-${cardIndex + 1}`, title, category, emoji }));
  return {
    ...level,
    title: scenario,
    teacher_hint: `Попроси пояснити принаймні дві картки у завданні «${scenario}», а не просто перетягнути їх.`,
    config_json: { ...level.config_json, cards, windowTitle: scenario, instruction: `Розсортуй усі картки у сценарії «${scenario}». Помилкова категорія не зараховується.` },
  };
}

const browserScenarios = [
  ['Офіційний Scratch', 'уроки Scratch для дітей', ['scratch.mit.edu', 'Офіційний Scratch', '🎮'], [['scratch-bonus.test', 'Безкоштовні монети', '🎁'], ['download-scratch-now.test', 'Scratch installer.exe', '⬇️']]],
  ['Електронний щоденник', 'увійти у шкільний щоденник', ['school.edu.ua', 'Портал школи', '🏫'], [['school-login-free.test', 'Вхід без пароля', '🔓'], ['marks-gift.test', 'Зміни оцінку за клік', '🎁']]],
  ['Відеоурок', 'як зібрати робота WeDo', ['education.lego.com', 'LEGO Education', '🤖'], [['lego-prize.test', 'Виграй набір зараз', '🏆'], ['robot-video.exe', 'Завантаж відео.exe', '☣️']]],
  ['Оновлення браузера', 'оновити браузер безпечно', ['support.google.com/chrome', 'Довідка Chrome', '🌐'], [['chrome-fast.test', 'SUPER UPDATE', '⚡'], ['browser_patch.scr', 'Термінове оновлення', '⚠️']]],
  ['Пошук зображень', 'безпечні фото космосу', ['images.nasa.gov', 'NASA Image Library', '🚀'], [['space-wallpaper.exe', '4K wallpaper installer', '⬇️'], ['nasa-gift.test', 'Подарунок від NASA', '🎁']]],
];

function browserVariant(level, index) {
  const [scenario, query, safe, danger] = browserScenarios[index];
  const results = [
    { id: `safe-${index}`, url: safe[0], title: safe[1], emoji: safe[2] },
    ...danger.map(([url, title, emoji], dangerIndex) => ({ id: `danger-${index}-${dangerIndex}`, url, title, emoji, danger: true })),
  ];
  return { ...level, title: scenario, teacher_hint: `У місії «${scenario}» зверни увагу на домен, обіцянки подарунків і тип файла.`, config_json: { ...level.config_json, query, results, cards: undefined, instruction: `Знайди єдиний безпечний результат для запиту «${query}».` } };
}

const emailScenarios = [
  ['Фальшива підтримка', 'support-security@free-prize.test', 'Терміново: акаунт заблоковано', 'Надішли пароль або акаунт зникне.', 'unlock.exe', 'Показати лист дорослому'],
  ['Підозрілий конкурс', 'winner@school-gift.test', 'Ти виграв планшет!', 'Заповни адресу та відкрий анкету.', 'winner_form.zip', 'Позначити як спам'],
  ['Чужий рахунок', 'payments@game-coins.test', 'Оплати покупку зараз', 'Натисни посилання та введи дані картки.', null, 'Не платити й покликати дорослого'],
  ['Невідоме вкладення', 'friend-photo@unknown.test', 'Дивись наше фото', 'Відкрий файл, це дуже смішно!', 'photo.jpg.exe', 'Не відкривати вкладення'],
  ['Підміна вчителя', 'teacher-homework@fastmail.test', 'Нове домашнє завдання', 'Увійди через цю форму шкільним паролем.', 'homework_link.html', 'Перевірити адресу з учителем'],
];

function emailVariant(level, index) {
  const [scenario, from, subject, message, attachment, correctTitle] = emailScenarios[index];
  const cards = [
    { id: `safe-${index}`, emoji: '🛡️', title: correctTitle, isCorrect: true },
    { id: `bad-${index}-1`, emoji: '🔑', title: 'Ввести пароль' },
    { id: `bad-${index}-2`, emoji: '📎', title: attachment ? 'Відкрити вкладення' : 'Перейти за посиланням' },
  ];
  return { ...level, title: scenario, teacher_hint: `Нехай дитина назве дві ознаки небезпеки у листі «${scenario}».`, config_json: { ...level.config_json, from, subject, message, attachment, cards, instruction: 'Прочитай адресу, тему й текст листа. Обери одну безпечну дію.' } };
}

const chatScenarios = [
  ['Подарунок у грі', ['Привіт! Хочеш безкоштовний скін?', 'Скинь пароль, і я додам його.'], 'Не відповідати й заблокувати'],
  ['Незнайомець поруч', ['Я живу недалеко від тебе.', 'Напиши адресу, зустрінемось без дорослих.'], 'Показати чат дорослому'],
  ['Секретний код', ['Мені терміново потрібен код із SMS.', 'Нікому не кажи про наше листування.'], 'Не надсилати код'],
  ['Образи в команді', ['Ти все зіпсував!', 'Я викладу твоє фото, якщо не підеш.'], 'Зберегти доказ і попросити допомоги'],
  ['Підозріле посилання', ['Ось нова версія гри!', 'Натисни short-link.test прямо зараз.'], 'Не відкривати посилання'],
];

function chatVariant(level, index) {
  const [scenario, messages, correctTitle] = chatScenarios[index];
  const cards = [
    { id: `safe-${index}`, emoji: '🛡️', title: correctTitle, isCorrect: true },
    { id: `bad-${index}-1`, emoji: '💬', title: 'Виконати прохання' },
    { id: `bad-${index}-2`, emoji: '🤫', title: 'Зберегти все в секреті' },
  ];
  return { ...level, title: scenario, teacher_hint: `Обговори, кому дитина розповість про ситуацію «${scenario}».`, config_json: { ...level.config_json, chatTitle: scenario, messages, cards, instruction: 'Прочитай всю розмову й вибери найбезпечнішу реакцію.' } };
}

const aiScenarios = [
  ['Розпізнавач природи', [['animal', 'Тварини', '🐾'], ['plant', 'Рослини', '🌿'], ['machine', 'Машини', '⚙️']], [['Кіт', 'animal', '🐱'], ['Дуб', 'plant', '🌳'], ['Робот', 'machine', '🤖'], ['Пес', 'animal', '🐶'], ['Квітка', 'plant', '🌼'], ['Дрон', 'machine', '🚁']]],
  ['Транспорт міста', [['land', 'Земля', '🚗'], ['water', 'Вода', '⛵'], ['air', 'Повітря', '✈️']], [['Автобус', 'land', '🚌'], ['Човен', 'water', '🛶'], ['Літак', 'air', '✈️'], ['Велосипед', 'land', '🚲'], ['Корабель', 'water', '🚢'], ['Гелікоптер', 'air', '🚁']]],
  ['Екосортування', [['recycle', 'Переробка', '♻️'], ['organic', 'Органіка', '🍂'], ['electronics', 'Електроніка', '🔌']], [['Пляшка', 'recycle', '🧴'], ['Шкірка', 'organic', '🍌'], ['Телефон', 'electronics', '📱'], ['Банка', 'recycle', '🥫'], ['Листя', 'organic', '🍃'], ['Батарейка', 'electronics', '🔋']]],
  ['Настрій повідомлень', [['kind', 'Добре', '🙂'], ['sad', 'Сумно', '😢'], ['angry', 'Сердито', '😠']], [['Дякую!', 'kind', '💚'], ['Мені самотньо', 'sad', '🌧️'], ['Віддай негайно!', 'angry', '💢'], ['Ти молодець', 'kind', '⭐'], ['Я засмутився', 'sad', '😔'], ['Це жахливо!', 'angry', '🔥']]],
  ['Космічний архів', [['planet', 'Планети', '🪐'], ['star', 'Зорі', '⭐'], ['vehicle', 'Апарати', '🚀']], [['Марс', 'planet', '🔴'], ['Сонце', 'star', '☀️'], ['Ракета', 'vehicle', '🚀'], ['Земля', 'planet', '🌍'], ['Сіріус', 'star', '✨'], ['Супутник', 'vehicle', '🛰️']]],
];

function aiVariant(level, index) {
  const [scenario, sourceCategories, sourceCards] = aiScenarios[index];
  const categories = sourceCategories.map(([id, title, emoji]) => ({ id, title, emoji }));
  const cards = sourceCards.map(([title, category, emoji], cardIndex) => ({ id: `sample-${index}-${cardIndex}`, title, category, emoji }));
  return { ...level, title: scenario, teacher_hint: `Після сортування «${scenario}» запитай, чому чисті приклади важливі для ШІ.`, config_json: { ...level.config_json, categories, cards, minCorrect: cards.length, labTitle: scenario, instruction: 'Навчи модель: правильно розклади кожен приклад. Для проходження потрібні всі правильні відповіді.' } };
}

const passwordScenarios = [
  ['Пароль для робота', ['Robo', 'Nova', '47', '!', '2026', 'name', '123'], ['name', '123'], 10, 4],
  ['Ключ космічної бази', ['Mars', 'Orbit', '8', '#', 'Moon', '000', 'password'], ['000', 'password'], 11, 4],
  ['Захист шкільного акаунта', ['Study', 'Book', '29', '$', 'Class', 'qwerty'], ['qwerty'], 12, 4],
  ['Сейф винахідника', ['Invent', 'Gear', '63', '%', 'Lab', 'admin'], ['admin'], 12, 4],
  ['Фінальний кіберщит', ['Cyber', 'Shield', '91', '&', 'Safe', 'login', '111'], ['login', '111'], 13, 4],
];

function passwordVariant(level, index) {
  const [scenario, parts, banned, minLength, need] = passwordScenarios[index];
  return { ...level, title: scenario, teacher_hint: `У «${scenario}» попроси дитину вголос перевірити довжину й чотири типи символів.`, config_json: { ...level.config_json, parts, banned, minLength, need, instruction: `Склади ключ для «${scenario}»: виконай усі ${need} умови й не використовуй заборонені частини.` } };
}

const digitalTypingTargets = ['SCRATCH', 'БЕЗПЕКА', 'RoboCity_7', 'Мій файл 2026', 'Ctrl + S'];
const scratchTypingTargets = ['move 10 steps', 'turn 15 degrees', 'change score by 1', 'when green flag clicked', 'say Hello!', 'repeat 10', 'if touching edge'];

function typingVariant(level, index) {
  const target = (level.game_id === DIGITAL_GAME_ID ? digitalTypingTargets : scratchTypingTargets)[index];
  const scenario = level.game_id === DIGITAL_GAME_ID ? `Клавіатурна місія: ${target}` : `Команда Scratch: ${target}`;
  return { ...level, title: scenario, teacher_hint: 'Не підказуй клавіші одразу: спочатку попроси знайти наступний підсвічений символ.', config_json: { ...level.config_json, target, instruction: `Надрукуй «${target}» без жодної помилки. Рівень зарахується лише зі 100% точністю.` } };
}

const hardwareScenarios = [
  ['Робоче місце', [['Мишка', 'hardware', '🖱️'], ['Браузер', 'software', '🌐'], ['Монітор', 'hardware', '🖥️'], ['Paint', 'software', '🎨'], ['Клавіатура', 'hardware', '⌨️']]],
  ['Студія відео', [['Камера', 'hardware', '📹'], ['Відеоредактор', 'software', '🎞️'], ['Мікрофон', 'hardware', '🎙️'], ['Медіаплеєр', 'software', '▶️'], ['Навушники', 'hardware', '🎧']]],
  ['Ігрова станція', [['Геймпад', 'hardware', '🎮'], ['Гра', 'software', '👾'], ['Відеокарта', 'hardware', '🧩'], ['Драйвер', 'software', '💿'], ['Колонки', 'hardware', '🔊']]],
  ['Шкільний клас', [['Принтер', 'hardware', '🖨️'], ['Текстовий редактор', 'software', '📝'], ['Сканер', 'hardware', '📠'], ['Презентація', 'software', '📊'], ['Проєктор', 'hardware', '📽️']]],
  ['Мережевий центр', [['Роутер', 'hardware', '📡'], ['Антивірус', 'software', '🛡️'], ['Кабель', 'hardware', '🔌'], ['Операційна система', 'software', '🪟'], ['Сервер', 'hardware', '🗄️']]],
];

function hardwareVariant(level, index) {
  const [scenario, sourceItems] = hardwareScenarios[index];
  const items = sourceItems.map(([title, type, emoji], itemIndex) => ({ id: `item-${index}-${itemIndex}`, title, type, emoji }));
  return { ...level, title: scenario, teacher_hint: `У наборі «${scenario}» дитина має пояснити різницю між пристроєм і програмою.`, config_json: { ...level.config_json, items, minCorrect: items.length, instruction: 'Визнач кожну картку правильно. Помилки треба виправити повторною спробою.' } };
}

const roboQuestions = [
  ['Що керує програмою робота?', 'Хаб', 'Камінь', 'Стрічка', '🧠'], ['Що допомагає роботу бачити відстань?', 'Датчик', 'Колесо', 'Балка', '📡'],
  ['Що змінити після зіткнення?', 'Алгоритм', 'Колір столу', 'Назву команди', '🔁'], ['Навіщо команді «стоп»?', 'Зупинити мотор', 'Увімкнути звук', 'Зібрати деталь', '🛑'],
  ['Що передає рух колесам?', 'Мотор', 'Лампочка', 'Хаб без програми', '⚙️'], ['Для чого потрібна шестерня?', 'Передавати обертання', 'Зберігати пароль', 'Показувати фото', '🔩'],
  ['Коли виконувати «взяти»?', 'На клітинці вантажу', 'На старті завжди', 'Після фінішу', '🦾'], ['Коли виконувати «ремонт»?', 'На клітинці поломки', 'Перед кожним кроком', 'На будь-якій стіні', '🔧'],
  ['Що перевірити перед запуском?', 'Послідовність команд', 'Лише колір робота', 'Гучність ноутбука', '✅'], ['Що робить датчик кольору?', 'Розрізняє кольори', 'Крутить колесо', 'Заряджає батарею', '🌈'],
  ['Як скоротити довгу програму?', 'Використати повторення', 'Додати випадкові блоки', 'Прибрати старт', '🔁'], ['Що означає успішний тест?', 'Робот виконав усі цілі', 'Робот просто рушив', 'Програма має багато блоків', '🏁'],
];

const scratchQuestions = [
  ['Що запускає сцену?', 'Зелений прапорець', 'Список спрайтів', 'Кнопка гучності', '🏁'], ['Що таке спрайт?', 'Персонаж або об’єкт', 'Пароль', 'Папка', '🐱'],
  ['Навіщо змінна score?', 'Рахувати бали', 'Малювати фон', 'Вмикати Wi-Fi', '⭐'], ['Що робить «repeat»?', 'Повторює команди', 'Видаляє спрайт', 'Зупиняє браузер', '🔁'],
  ['Де виконується гра?', 'На сцені', 'У кошику', 'У паролі', '🎬'], ['Що таке костюм?', 'Вигляд спрайта', 'Команда руху', 'Звукова карта', '👕'],
  ['Навіщо умова «if»?', 'Перевірити правило', 'Завжди рухатись', 'Створити пароль', '🔀'], ['Що робить «broadcast»?', 'Надсилає повідомлення спрайтам', 'Друкує файл', 'Видаляє фон', '📣'],
  ['Як зробити гру чесною?', 'Чітко задати умову перемоги', 'Сховати всі правила', 'Додати випадковий пароль', '⚖️'], ['Що відбувається при клонуванні?', 'Створюється копія спрайта', 'Зникає сцена', 'Закривається проєкт', '👥'],
  ['Навіщо координата x?', 'Рух ліворуч і праворуч', 'Зміна гучності', 'Лічба балів', '↔️'], ['Навіщо координата y?', 'Рух вгору і вниз', 'Зміна костюма', 'Запуск таймера', '↕️'],
  ['Що робить блок «touching»?', 'Перевіряє дотик', 'Вмикає музику', 'Створює змінну', '👆'], ['Коли додавати бал?', 'Після виконання цілі', 'На кожному старті без умови', 'Після закриття гри', '+1'],
  ['Навіщо тестувати проєкт?', 'Знайти й виправити помилки', 'Збільшити назву', 'Сховати код', '🧪'], ['Що таке алгоритм?', 'Послідовність команд', 'Набір картинок', 'Ім’я спрайта', '🧩'],
  ['Як зупинити гру?', 'Використати стоп', 'Додати рух', 'Змінити фон', '🛑'], ['Для чого потрібен звук?', 'Дати гравцю зворотний зв’язок', 'Замінити всі команди', 'Сховати фініш', '🔊'],
  ['Що має бути у фінальній грі?', 'Мета й умова перемоги', 'Лише один спрайт', 'Тільки порожня сцена', '🏆'], ['Що показати під час презентації?', 'Як працює власний алгоритм', 'Чужий пароль', 'Випадковий сайт', '🎤'],
  ['Що робити після помилки?', 'Знайти блок і виправити', 'Видалити весь проєкт', 'Натискати навмання', '🐞'],
];

function quizVariant(level, index) {
  const bank = level.game_id === ROBOT_GAME_ID ? roboQuestions : scratchQuestions;
  const slice = bank.slice(index * 3, index * 3 + 3);
  const questions = slice.map(([text, correct, wrongA, wrongB, emoji], questionIndex) => ({
    text,
    options: [
      { title: wrongA, emoji: '❌' },
      { title: correct, emoji, correct: true },
      { title: wrongB, emoji: '❔' },
    ].slice(questionIndex).concat([
      { title: wrongA, emoji: '❌' },
      { title: correct, emoji, correct: true },
      { title: wrongB, emoji: '❔' },
    ].slice(0, questionIndex)),
  }));
  const scenario = level.game_id === ROBOT_GAME_ID ? `RoboLab: перевірка ${index + 1}` : `Scratch: перевірка ${index + 1}`;
  return { ...level, title: scenario, teacher_hint: 'Після відповіді попроси коротко пояснити правило своїми словами.', config_json: { ...level.config_json, questions, minCorrect: questions.length, instruction: 'Дай правильну відповідь на кожне питання. Випадкове проклацування тест не зарахує.' } };
}

const scratchBlocks = [
  ['event_flag', '🏁', 'коли натиснуто прапорець'], ['event_key', '⌨️', 'коли натиснуто клавішу'], ['event_click', '👆', 'коли клікнули спрайт'], ['event_message', '📣', 'коли отримано повідомлення'],
  ['move', '➡️', 'рухатись'], ['turn', '↪️', 'повернути'], ['jump', '⬆️', 'стрибнути'], ['glide', '🛝', 'ковзати'], ['say', '💬', 'сказати'], ['sound', '🔊', 'відтворити звук'], ['costume', '👕', 'змінити костюм'], ['clone', '👥', 'створити клон'],
  ['repeat', '🔁', 'повторити'], ['if_touch', '👆', 'якщо торкається'], ['if_edge', '🧱', 'якщо край'], ['wait', '⏳', 'чекати'],
  ['score', '⭐', 'додати бал'], ['broadcast', '📡', 'надіслати повідомлення'], ['stop', '🛑', 'зупинити'], ['win', '🏆', 'перемога'],
];
const scratchBlockMap = new Map(scratchBlocks.map(([id, emoji, title]) => [id, { id, emoji, title }]));
const scratchEvents = ['event_flag', 'event_key', 'event_click', 'event_message'];
const scratchActions = ['move', 'turn', 'jump', 'glide', 'say', 'sound', 'costume', 'clone'];
const scratchControls = ['repeat', 'if_touch', 'if_edge', 'wait'];
const scratchFinishes = ['score', 'broadcast', 'stop', 'win'];

function scratchBlocksVariant(level, index) {
  const event = scratchEvents[index % scratchEvents.length];
  const firstAction = scratchActions[index % scratchActions.length];
  const control = scratchControls[Math.floor(index / scratchActions.length) % scratchControls.length];
  let secondAction = scratchActions[(index * 3 + 2) % scratchActions.length];
  if (secondAction === firstAction) secondAction = scratchActions[(index + 1) % scratchActions.length];
  const finish = scratchFinishes[Math.floor(index / 2) % scratchFinishes.length];
  const targetBlocks = [event, firstAction, control, secondAction, finish];
  const decoys = scratchBlocks.map(([id]) => id).filter((id) => !targetBlocks.includes(id));
  const paletteIds = [...targetBlocks, decoys[index % decoys.length], decoys[(index * 5 + 3) % decoys.length]];
  const palette = paletteIds.map((id) => scratchBlockMap.get(id));
  const stageThemes = [['🐱', '⭐', '🏁'], ['🚀', '🪐', '👾'], ['🐠', '🌊', '🦈'], ['🦸', '🏙️', '💎'], ['🐶', '🦴', '🏠'], ['🧙', '🏰', '🐉']];
  const scenario = `Scratch-місія ${index + 1}: ${scratchBlockMap.get(firstAction).title} і ${scratchBlockMap.get(finish).title}`;
  return { ...level, title: scenario, teacher_hint: `Підкажи лише роль блоку «${scratchBlockMap.get(control).title}», не називаючи всю послідовність.`, config_json: { ...level.config_json, palette, targetBlocks, stageItems: stageThemes[index % stageThemes.length], instruction: `Створи програму для сцени: подія, дві дії, керування та результат. Є два зайві блоки.` } };
}

const sceneVariants = [
  ['Збери платформер', ['hero', 'platform', 'goal'], [['hero', '🐱', 'герой'], ['platform', '🧱', 'платформа'], ['goal', '🏁', 'фініш'], ['cloud', '☁️', 'хмаринка'], ['enemy', '👾', 'ворог']], ['Хтось має рухатись', 'Потрібна опора', 'Має бути точка завершення']],
  ['Лови яблука', ['basket', 'apple', 'score'], [['basket', '🧺', 'кошик'], ['apple', '🍎', 'яблуко'], ['score', '⭐', 'рахунок'], ['rock', '🪨', 'камінь'], ['sun', '☀️', 'сонце']], ['Чим ловити?', 'Що падає?', 'Як рахувати успіх?']],
  ['Космічна втеча', ['rocket', 'meteor', 'goal'], [['rocket', '🚀', 'ракета'], ['meteor', '☄️', 'метеорит'], ['goal', '🪐', 'планета'], ['alien', '👽', 'прибулець'], ['star', '⭐', 'зірка']], ['Потрібен транспорт', 'Потрібна небезпека', 'Потрібна ціль польоту']],
  ['Підводний квест', ['fish', 'pearl', 'timer'], [['fish', '🐠', 'рибка'], ['pearl', '🦪', 'перлина'], ['timer', '⏱️', 'таймер'], ['shark', '🦈', 'акула'], ['coral', '🪸', 'корал']], ['Хто шукає?', 'Що треба знайти?', 'Що обмежує час?']],
  ['Музичний концерт', ['singer', 'sound', 'audience'], [['singer', '🎤', 'виконавець'], ['sound', '🎵', 'музика'], ['audience', '👏', 'глядачі'], ['light', '💡', 'світло'], ['ticket', '🎟️', 'квиток']], ['Хтось виступає', 'Має звучати музика', 'Хтось слухає']],
  ['Лабіринт ключів', ['hero', 'key', 'door'], [['hero', '🧙', 'мандрівник'], ['key', '🔑', 'ключ'], ['door', '🚪', 'двері'], ['ghost', '👻', 'привид'], ['coin', '🪙', 'монета']], ['Хтось проходить лабіринт', 'Щось відкриває шлях', 'Є закритий вихід']],
  ['Фінальна гра', ['hero', 'enemy', 'score', 'goal'], [['hero', '🦸', 'герой'], ['enemy', '🐉', 'суперник'], ['score', '⭐', 'рахунок'], ['goal', '🏆', 'перемога'], ['decoration', '🌈', 'декорація'], ['sound', '🔊', 'звук']], ['Є головний персонаж', 'Є перешкода', 'Рахується результат', 'Є умова перемоги']],
];

function scratchSceneVariant(level, index) {
  const [scenario, required, sourceItems, clues] = sceneVariants[index];
  const items = sourceItems.map(([id, emoji, title]) => ({ id, emoji, title }));
  return { ...level, title: scenario, teacher_hint: `У «${scenario}» читай підказки як вимоги гри, але не називай потрібні картки.`, config_json: { ...level.config_json, required, items, clues, instruction: 'Прочитай умови й вибери рівно ті об’єкти, без яких гра не працюватиме.' } };
}

const variantBuilders = {
  robotRoute: robotRouteVariant,
  robotAssembly: robotAssemblyVariant,
  desktopDrag: desktopVariant,
  browserHunt: browserVariant,
  emailAction: emailVariant,
  chatAction: chatVariant,
  aiTrainerGame: aiVariant,
  passwordBuilder: passwordVariant,
  typingGame: typingVariant,
  keyboardTrainer: typingVariant,
  hardwareSort: hardwareVariant,
  quizBattle: quizVariant,
  scratchBlocks: scratchBlocksVariant,
  scratchScene: scratchSceneVariant,
};

export function enhanceLevels(levels = []) {
  const counters = new Map();
  return levels.map((level) => {
    const mode = level.config_json?.mode || level.type;
    const key = `${level.game_id}|${mode}`;
    const index = counters.get(key) || 0;
    counters.set(key, index + 1);
    const builder = variantBuilders[mode];
    return builder ? builder(level, index) : level;
  });
}

export const LEVEL_GAME_IDS = { ROBOT_GAME_ID, DIGITAL_GAME_ID, SCRATCH_GAME_ID };
