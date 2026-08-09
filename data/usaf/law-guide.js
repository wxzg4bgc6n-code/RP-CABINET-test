/* v109: памятка УАК/ПК — сначала практическая часть USAF, затем общие правила. */
(function attachUsafLawGuide(){
  const registry = window.RPCabinetTemplates || [];
  const usafTemplate = registry.find((item) => item && item.id === "usafInfoTemplateV20");
  if (!usafTemplate || typeof usafTemplate.markup !== "string" || usafTemplate.markup.includes('id="usaf-law"')) return;

  const lawSection = `
<section id="usaf-law" class="usaf-info-section" data-usaf-source="law">
  <details class="section-toggle academy-expand-card">
    <summary class="academy-section-head-card">
      <h2>УАК и ПК для USAF: задержание и передача</h2>
      <p class="section-desc">Сначала — действия бойца USAF на службе. Ниже — общие правила госфракций и процессуальная часть.</p>
    </summary>
    <div class="academy-expand-content usaf-expand-content usaf-law-content-v92">
      <div class="usaf-law-board-v92">

        <section class="usaf-law-group-v92" aria-labelledby="usaf-law-basis-v92">
          <header class="usaf-law-group-head-v92"><h3 id="usaf-law-basis-v92">Что нужно запомнить в первую очередь</h3></header>
          <div class="usaf-law-fact-grid-v92">
            <article class="usaf-law-fact-v92"><strong>4+</strong><h4>Наручники</h4><p>Использовать наручники можно с 4-го порядкового звания, только при веской причине и с обязательной видеофиксацией на включённую бодикамеру.</p></article>
            <article class="usaf-law-fact-v92"><strong>6+</strong><h4>Тазер USAF</h4><p>Боец USAF может иметь и применять тазер с 6-го порядкового звания — законно, соразмерно угрозе и в рамках стадий применения силы.</p></article>
            <article class="usaf-law-fact-v92"><strong>MP</strong><h4>Основной вызов</h4><p>Нарушения на территории форта передаются Military Police. MP осуществляет надзор за подразделениями NG и пресекает правонарушения.</p></article>
            <article class="usaf-law-fact-v92"><strong>3 пункта</strong><h4>Передача</h4><p>Прибывшему MP назови основание задержания, предполагаемую статью и покажи видеофиксацию нарушения.</p></article>
          </div>
        </section>

        <section class="usaf-law-group-v92" aria-labelledby="usaf-law-flow-v109">
          <header class="usaf-law-group-head-v92"><h3 id="usaf-law-flow-v109">Алгоритм обычного бойца USAF</h3></header>
          <div class="usaf-law-flow-v109">
            <article><span class="usaf-law-step-v109">01</span><div><h4>Включи бодикамеру</h4><p>Зафиксируй само нарушение, дальнейшие команды, применение спецсредств и передачу сотруднику MP.</p></div></article>
            <article><span class="usaf-law-step-v109">02</span><div><h4>Обозначь себя и дай законное требование</h4><p>Говори спокойно и конкретно. Если человек не понял требование — повтори его ещё один раз.</p></div></article>
            <article><span class="usaf-law-step-v109">03</span><div><h4>Оцени угрозу</h4><p>Если непосредственной угрозы нет, не переходи сразу к тазеру или оружию. Применяй только необходимую и соразмерную силу.</p></div></article>
            <article><span class="usaf-law-step-v109">04</span><div><h4>Ограничь движение только при наличии основания</h4><p>Наручники — с 4-го звания, при веской причине и включённой бодикамере. Наручники не являются наказанием.</p></div></article>
            <article><span class="usaf-law-step-v109">05</span><div><h4>Вызови MP по точке</h4><p>Используй 911-код нужного поста или объекта и кратко сообщи ситуацию.</p></div></article>
            <article><span class="usaf-law-step-v109">06</span><div><h4>Передай задержанного</h4><p>Назови, что произошло, по какой статье подозреваешь человека, где и когда это было, затем передай видео.</p></div></article>
            <article><span class="usaf-law-step-v109">07</span><div><h4>Сохрани запись</h4><p>Не распространяй материалы из FZ посторонним. При задержании запись может быть предоставлена ОГП и адвокату в установленном порядке.</p></div></article>
          </div>
        </section>

        <section class="usaf-law-group-v92" aria-labelledby="usaf-law-call-v92">
          <header class="usaf-law-group-head-v92"><h3 id="usaf-law-call-v92">Кого вызывать</h3></header>
          <div class="usaf-law-call-grid-v92">
            <article><strong>911-1</strong><span>MP на КПП-1</span></article>
            <article><strong>911-2</strong><span>MP на КПП-2</span></article>
            <article><strong>911-3</strong><span>MP к АК</span></article>
            <article><strong>911-4</strong><span>MP к HTP</span></article>
            <article><strong>911-5</strong><span>MP к складу</span></article>
            <article><strong>911-48</strong><span>MP на плац</span></article>
          </div>
          <div class="usaf-law-call-notes-v92">
            <p><b>Нарушил военнослужащий:</b> фиксируй и сообщай командующему составу его подразделения, MP или Генеральскому составу.</p>
            <p><b>Нужна обычная полиция:</b> общий код 10-200. Используй его по ситуации или по указанию MP/старшего состава.</p>
            <p><b>Запрошен адвокат или звонок:</b> не игнорируй запрос и не обещай ложный результат — немедленно передай его сотруднику, который ведёт процессуальные действия.</p>
          </div>
        </section>

        <section class="usaf-law-group-v92" aria-labelledby="usaf-law-speech-v92">
          <header class="usaf-law-group-head-v92"><h3 id="usaf-law-speech-v92">Что говорить: готовый сценарий</h3></header>
          <div class="usaf-law-script-grid-v92">
            <article class="usaf-law-script-v92"><span>Первичный контакт</span><div class="report-command" role="textbox" aria-readonly="true">Гражданин, остановитесь. Я военнослужащий National Guard, [звание, имя]. Ведётся видеофиксация. Выполните законное требование: [требование].</div></article>
            <article class="usaf-law-script-v92"><span>Проверка на КПП</span><div class="report-command" role="textbox" aria-readonly="true">Предъявите документы через ограждение. После разрешения покиньте транспорт, поднимите руки за голову и встаньте лицом к стене для досмотра.</div></article>
            <article class="usaf-law-script-v92"><span>Временное задержание</span><div class="report-command" role="textbox" aria-readonly="true">Вы временно задержаны по подозрению в [кратко назвать нарушение]. Не сопротивляйтесь. Для дальнейшего разбирательства вызвана Military Police.</div></article>
            <article class="usaf-law-script-v92"><span>Вызов MP</span><div class="report-command" role="textbox" aria-readonly="true">/r 911-2, КПП-2. Задержано подозрительное лицо, требуется сотрудник MP.</div></article>
            <article class="usaf-law-script-v92"><span>Передача сотруднику MP</span><div class="report-command" role="textbox" aria-readonly="true">Сэр/Мэм, гражданин задержан на [место] за [что сделал]. Подозревается по статье [номер и краткое название]. Нарушение и задержание записаны на бодикамеру.</div></article>
            <article class="usaf-law-script-v92"><span>Если полный процесс разрешён</span><div class="report-command" role="textbox" aria-readonly="true">Вы вправе молчать; сказанное может быть использовано против вас. Вам доступны один телефонный звонок и адвокат. Права понятны?</div><p>Эту часть произносит тот, кто законно ведёт полную процедуру. При непонимании права разъясняются повторно.</p></article>
          </div>
        </section>

        <section class="usaf-law-group-v92" aria-labelledby="usaf-law-items-v92">
          <header class="usaf-law-group-head-v92"><h3 id="usaf-law-items-v92">Досмотр и запрещённые предметы</h3></header>
          <div class="usaf-law-split-v92">
            <article><h4>При досмотре на КПП</h4><ul><li>Запроси документы и действуй по правилам конкретного КПП.</li><li>Попроси человека покинуть ТС, поднять руки и встать лицом к стене.</li><li>Проведи предусмотренный правилами досмотр человека и транспорта.</li><li>При алкоголе, наркотиках, кальяне/бонге, отмычках, стяжках или нелегальном оружии вызывай MP.</li></ul></article>
            <article><h4>Предмет лежит на территории FZ</h4><ul><li>Нелегальное оружие и запрещённые средства не подбирай — вызови MP.</li><li>Боеприпасы, бронежилет или аптечки можно вернуть на склад.</li><li>Исключение для нелегального оружия: нападение на поставку, патруль или СО за пределами FZ — найденное передаётся Капралу Клиффорду.</li><li>Не уничтожай и не скрывай возможное доказательство.</li></ul></article>
          </div>
        </section>

        <section class="usaf-law-group-v92" aria-labelledby="usaf-law-qa-v109">
          <header class="usaf-law-group-head-v92"><h3 id="usaf-law-qa-v109">Важные вопросы для сдачи</h3></header>
          <div class="usaf-law-qa-grid-v109">
            <article><h4>С какого звания можно использовать наручники?</h4><p>С 4-го порядкового звания. Нужна веская причина и обязательная запись на включённую бодикамеру.</p></article>
            <article><h4>С какого звания USAF может использовать тазер?</h4><p>С 6-го порядкового звания, при законном и соразмерном применении силы.</p></article>
            <article><h4>Кого вызывать при подозрительном лице на КПП?</h4><p>Military Police соответствующим 911-кодом по месту. После прибытия передать задержанного, основание, предполагаемую статью и видео.</p></article>
            <article><h4>Можно ли надеть наручники «на всякий случай»?</h4><p>Нет. Нужна веская причина. Ограничение свободы без основания и без фиксации может стать нарушением уже со стороны военнослужащего.</p></article>
            <article><h4>Что делать, если не уверен в номере статьи?</h4><p>Не выдумывать статью. Чётко зафиксировать факты, вызвать MP и передать, что именно сделал человек. Квалификацию уточняет уполномоченный сотрудник.</p></article>
            <article><h4>Что передать сотруднику MP?</h4><p>Место и время, событие, законное требование и реакцию человека, основание задержания, предполагаемую статью, найденные предметы и непрерывную видеофиксацию.</p></article>
            <article><h4>Можно ли сразу применять тазер или огнестрельное оружие?</h4><p>Нет. Сила должна соответствовать угрозе. Начинай с понятного требования и предупреждения, если обстановка позволяет. Летальная сила допустима только на законных основаниях.</p></article>
            <article><h4>Что делать с запрещённым предметом, найденным при досмотре?</h4><p>Вызвать MP, сохранить фиксацию и не проводить самостоятельный полный арест без соответствующих полномочий.</p></article>
            <article><h4>Можно ли передавать видео из FZ посторонним?</h4><p>Нет. Исключения: разрешение Генеральского состава, а при задержании — предоставление ОГП и адвокату в установленном порядке.</p></article>
            <article><h4>Что делать, если нарушение совершил другой военнослужащий?</h4><p>Зафиксировать и сообщить командующему составу его подразделения, MP или Генеральскому составу.</p></article>
          </div>
        </section>

        <section class="usaf-law-group-v92" aria-labelledby="usaf-law-project-rules-v109">
          <header class="usaf-law-group-head-v92"><h3 id="usaf-law-project-rules-v109">Правила гос. фракций: важное для ARMY</h3></header>
          <div class="usaf-law-split-v92">
            <article><h4>Кто считается силовой структурой</h4><ul><li>LSPD, LSSD, FIB, ARMY, SASPA и USSS.</li><li>ARMY может задержать гражданина за противоправные действия только с последующей обязательной передачей сотрудникам правоохранительных фракций.</li><li>При исполнении сотрудникам силовых структур запрещено использовать личный транспорт, кроме предусмотренных правилами исключений.</li></ul></article>
            <article><h4>Когда нельзя задерживать / досматривать</h4><ul><li>После потери сознания и появления игрока в палате EMS.</li><li>На территории Maze Bank Arena и сезонных мероприятий.</li><li>Сразу после выхода из деморгана, КПЗ или Федеральной тюрьмы.</li><li>Исключения: провокация сотрудников, непрерывная погоня, функциональный розыск 4–5 звёзд, помеха работе EMS.</li></ul></article>
          </div>
          <div class="usaf-law-split-v92">
            <article><h4>Изъятие и лицензии</h4><ul><li>Изъятие улик и запрещённых предметов выполняется через G → Работа → Изъять.</li><li>До приезда в место оформления (КПЗ/ФТ) нельзя изымать нелегальное имущество и рвать лицензии.</li><li>Исключение по лицензиям — случаи, строго предусмотренные законодательством и не требующие последующего ареста.</li></ul></article>
            <article><h4>Особые территории</h4><ul><li>Чёрный рынок и перечисленные криминальные зоны — без нахождения и взаимодействия; при непрерывной погоне разрешён заезд для задержания.</li><li>На Чёрном рынке разрешено находиться в момент противостояния за него.</li><li>У особняка чужой организации нельзя без ордера поджидать или провоцировать игроков; действуют исключения для непрерывной погони и нарушения закона конкретным лицом.</li></ul></article>
          </div>
        </section>

        <section class="usaf-law-group-v92" aria-labelledby="usaf-law-difference-v92">
          <header class="usaf-law-group-head-v92"><h3 id="usaf-law-difference-v92">Не путать на экзамене</h3></header>
          <div class="usaf-law-compare-v92">
            <article><h4>Задержание</h4><p>Временное ограничение свободы для проверки обстоятельств и дальнейшей передачи. Это ещё не признание виновным и не наказание.</p></article>
            <article><h4>Арест</h4><p>Назначение и исполнение наказания уполномоченным сотрудником после установления оснований и соблюдения процедуры.</p></article>
            <article><h4>Досмотр</h4><p>Проверка человека или транспорта в предусмотренной законом и правилами ситуации, в том числе при въезде на охраняемую территорию.</p></article>
            <article><h4>Обыск</h4><p>Отдельное процессуальное действие для поиска предметов и доказательств. Не подменяй им обычную проверку на КПП.</p></article>
          </div>
        </section>

        <section class="usaf-law-group-v92" aria-labelledby="usaf-law-evidence-v109">
          <header class="usaf-law-group-head-v92"><h3 id="usaf-law-evidence-v109">Уголовные дела: требования к уликам</h3></header>
          <div class="usaf-law-fact-grid-v92 usaf-law-evidence-grid-v109">
            <article class="usaf-law-fact-v92"><strong>8</strong><h4>Минимум улик</h4><p>Для дела на рейд криминальной фракции требуется минимум 8 улик.</p></article>
            <article class="usaf-law-fact-v92"><strong>BodyCam</strong><h4>Фиксация</h4><p>Для записи улик используется функциональная боди-камера.</p></article>
            <article class="usaf-law-fact-v92"><strong>Полная запись</strong><h4>От начала до конца</h4><p>Улика должна показывать ситуацию полностью — от начала до фактического завершения. Обрезанный отдельный фрагмент не принимается.</p></article>
          </div>
          <div class="usaf-law-fact-grid-v92 usaf-law-evidence-extra-v110">
            <article class="usaf-law-fact-v92"><strong>Улика</strong><h4>Монтаж записи</h4><p>Улика не должна подвергаться видеомонтажу. Исключение — записи с голосом или видео человека, дающего показания (осведомителя).</p></article>
            <article class="usaf-law-fact-v92"><strong>Ордер</strong><h4>Перед рейдом</h4><p>Для получения ордера необходимо отыграть передачу дела сотруднику прокуратуры и иметь видео/фотофиксацию для администрации.</p></article>
          </div>
        </section>

        <section class="usaf-law-group-v92" aria-labelledby="usaf-law-interrogation-v109">
          <header class="usaf-law-group-head-v92"><h3 id="usaf-law-interrogation-v109">Допросы: не путать два режима</h3></header>
          <div class="usaf-law-compare-v92">
            <article><h4>Официальный допрос / беседа</h4><p>От 3 до 8 сотрудников, в комнате с подозреваемым — не более 3. Задаётся от 8 до 10 вопросов. Максимальная длительность — 30 минут. Вопросы в /do запрещены.</p></article>
            <article><h4>Допрос с насильственными действиями</h4><p>Только FIB CID. От 3 до 8 сотрудников, в комнате — не более 3, все участники в масках. Ровно 10 вопросов, их количество сообщается заранее. Максимальная длительность — 60 минут.</p></article>
            <article><h4>Ограничения обычного допроса</h4><p>Нельзя использовать информацию, которой персонаж не может владеть, и нельзя угрожать насильственными действиями или действиями сексуального характера. Если подозреваемый оказался в нокауте — он подлежит освобождению.</p></article>
            <article><h4>Вопросы при допросе с пристрастием</h4><p>Каждый вопрос нумеруется; в одном вопросе — одна ситуация. Одинаковые вопросы, даже с изменённой формулировкой, запрещены. В /do разрешены только вопросы о состоянии здоровья.</p></article>
          </div>
        </section>
      </div>
    </div>
  </details>
</section>`;

  usafTemplate.markup = usafTemplate.markup.replace('<section id="usaf-ten"', `${lawSection}<section id="usaf-ten"`);
})();
