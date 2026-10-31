/* Story data for 별이 내리는 밤, 너와 */
(() => {
  'use strict';

  const scenes = {
    /* ───────────────────────── CHAPTER 1 ───────────────────────── */
    c1_1: {
      bg: 'rain-street', chapter: 1, chapterName: '첫 번째 밤', mood: 'night',
      time: '금요일 · 오후 8:07',
      narration: true,
      chapterIntro: true,
      text: '비가 내리는 금요일 밤이었다. 퇴근길에 받은 메일 한 통이, 우산까지 앗아간 기분이었다.',
      next: 'c1_2'
    },
    c1_2: {
      bg: 'rain-street', time: '금요일 · 오후 8:12',
      narration: true,
      text: '원고는 또 반려됐다. 스물일곱 번째. 나는 젖은 우산을 접고, 간판도 잘 보이지 않는 좁은 계단을 올랐다.',
      next: 'c1_3'
    },
    c1_3: {
      bg: 'cafe', mood: 'cafe', time: '금요일 · 오후 8:16',
      narration: true,
      text: '계단 끝에서 작은 카페 ‘루나’가 숨을 고르고 있었다. 창밖의 비, 따뜻한 전등, 그리고 나를 바라보는 낯선 목소리.',
      next: 'c1_4'
    },
    c1_4: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '어서 오세요. 손님, 혹시… 별을 좋아하세요?',
      next: 'c1_choice_greet'
    },
    c1_choice_greet: {
      bg: 'cafe', speaker: '나',
      text: '처음 보는 사람에게 별을 좋아하냐고 묻다니. 이상하게도, 그 질문이 오늘 하루 중 가장 다정하게 들렸다.',
      choices: [
        { label: '“별보다는… 이 카페가 좋아서 왔어요.”', affection: 2, next: 'c1_greet_a' },
        { label: '“좋아해요. 특히 겨울 별자리요.”', trust: 2, next: 'c1_greet_b' },
        { label: '“비 오는 날엔, 따뜻한 라떼가 더 좋더라고요.”', affection: 1, trust: 1, next: 'c1_greet_c' }
      ]
    },
    c1_greet_a: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '어머. 그건… 제가 오늘 제일 듣고 싶었던 말일지도요.',
      next: 'c1_greet_a2'
    },
    c1_greet_a2: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '그런 말, 쉽게 하시면 안 돼요. 저, 금방 믿어버리는 편이라서요.',
      next: 'c1_5'
    },
    c1_greet_b: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '겨울 별자리요? 그럼 오늘 밤은… 오리온을 좋아하시겠네요. 제가 제일 좋아하는 별자리예요.',
      next: 'c1_greet_b2'
    },
    c1_greet_b2: {
      bg: 'cafe', speaker: '서아', expr: 'laugh',
      text: '벨트에 세 개의 별이 나란히 있는 거, 아세요? 오늘 밤엔 하늘이 흐려서 안 보이겠지만요.',
      next: 'c1_5'
    },
    c1_greet_c: {
      bg: 'cafe', speaker: '서아', expr: 'laugh',
      text: '후훗. 그럼 오늘은 제가, 비 오는 날의 라떼를 만들어드릴게요.',
      next: 'c1_greet_c2'
    },
    c1_greet_c2: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '대신, 별 이야기도 조금만 들어주세요. 오늘 손님이 한 분뿐이라… 조금 수다스러워졌어요.',
      next: 'c1_5'
    },
    c1_5: {
      bg: 'cafe', time: '금요일 · 오후 8:24',
      narration: true,
      text: '창가 자리에 앉았다. 유리창 너머로 도시의 불빛이 비를 맞고 있었다. 이름표에는 ‘서아’라고 쓰여 있었다.',
      next: 'c1_6'
    },
    c1_6: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '뭐 드시고 싶으세요? …아니, 오늘은 제가 추천해도 될까요?',
      next: 'c1_choice_drink'
    },
    c1_choice_drink: {
      bg: 'cafe', speaker: '나',
      text: '메뉴판을 보지도 않고 고개를 끄덕였다. 오늘만큼은, 누군가의 선택에 기대보고 싶었다.',
      choices: [
        { label: '“추천해주세요. 오늘은 그게 좋아요.”', affection: 2, next: 'c1_drink_a' },
        { label: '“라벤더가 들어간, 달지 않은 걸로 부탁해요.”', affection: 1, trust: 1, next: 'c1_drink_b' },
        { label: '“서아 씨가 제일 좋아하는 걸로 주세요.”', affection: 1, trust: 1, next: 'c1_drink_c' }
      ]
    },
    c1_drink_a: {
      bg: 'cafe', speaker: '서아', expr: 'laugh',
      text: '좋아요. 그럼 오늘 기분에 맞는 걸로. 조금 달고, 조금 따뜻한 걸로요.',
      next: 'c1_7'
    },
    c1_drink_b: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '라벤더를 아시네요. 그건… 제가 혼자 좋아해서 몰래 넣던 재료인데.',
      next: 'c1_drink_b2'
    },
    c1_drink_b2: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '손님 취향이 저랑 비슷한가 봐요. 왠지 조금, 기분이 좋네요.',
      next: 'c1_7'
    },
    c1_drink_c: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '제가 제일 좋아하는 거요? 그건… 비밀인데. 그래도 오늘은 특별히 알려드릴게요.',
      next: 'c1_drink_c2'
    },
    c1_drink_c2: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '루나 라떼. 별처럼 반짝이는 꿀을 올린 라떼예요. 제가 만든 메뉴거든요.',
      next: 'c1_7'
    },
    c1_7: {
      bg: 'cafe', time: '금요일 · 오후 8:31', mood: 'cafe',
      narration: true,
      text: '잠시 후, 컵 위에 작은 별이 그려진 라떼가 내려왔다. 김이 오르는 컵 표면에, 별 하나가 천천히 흔들렸다.',
      memory: { id: 'latte', title: '루나 라떼', desc: '비 오는 첫날, 컵 위에 작은 별을 그려준 밤.', glyph: '☕' },
      next: 'c1_8'
    },
    c1_8: {
      bg: 'cafe', speaker: '나',
      text: '한 모금 마셨다. 달콤함 뒤에 라벤더 향이 은은하게 남았다. 이상하게, 코끝이 시큰했다.',
      next: 'c1_9'
    },
    c1_9: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '앗—',
      next: 'c1_10'
    },
    c1_10: {
      bg: 'cafe', time: '금요일 · 오후 8:42',
      narration: true,
      text: '계산대 옆에서 스케치북이 미끄러졌다. 바닥에 펼쳐진 페이지마다, 별자리가 피어 있었다.',
      next: 'c1_choice_sketch'
    },
    c1_choice_sketch: {
      bg: 'cafe', speaker: '나',
      text: '주워주려다 손이 멈췄다. 종이 위의 별들은, 어딘가로 가고 싶어 하는 것처럼 보였다.',
      choices: [
        { label: '“이거… 직접 그리신 거예요?”', affection: 1, trust: 2, next: 'c1_sketch_a' },
        { label: '“별을 이렇게 그리는 사람은 처음 봐요.”', affection: 2, next: 'c1_sketch_b' },
        { label: '조용히 주워서, 덮어준다.', trust: 2, next: 'c1_sketch_c' }
      ]
    },
    c1_sketch_a: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '네… 그냥, 취미로요. 보여드릴 생각은 없었는데. 부끄럽네요.',
      next: 'c1_sketch_a2'
    },
    c1_sketch_a2: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '그래도… 누가 알아봐 주니까, 조금 기쁘기도 하고요.',
      next: 'c1_11'
    },
    c1_sketch_b: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '처음… 이렇게 말해주는 손님이에요. 보통은 “예쁘네요” 하고 끝나거든요.',
      next: 'c1_sketch_b2'
    },
    c1_sketch_b2: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '별은 그리기 어려운데, 자꾸 그리고 싶어서요. 밤하늘은… 누구의 것이든 아니잖아요.',
      next: 'c1_11'
    },
    c1_sketch_c: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '아, 감사합니다. …앗, 페이지 순서가.',
      next: 'c1_sketch_c2'
    },
    c1_sketch_c2: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '그냥… 덮어주실 줄 알았는데. 끝까지 보지 않으셔서, 조금 안심했어요. 그리고 조금, 서운하고요.',
      next: 'c1_11'
    },
    c1_11: {
      bg: 'cafe', time: '금요일 · 오후 9:05',
      speaker: '서아', expr: 'smile',
      text: '저는 한서아예요. 서아라고 불러주세요. 이 카페에서 일한 지는… 두 달쯤 됐어요.',
      next: 'c1_12'
    },
    c1_12: {
      bg: 'cafe', speaker: '나',
      text: '나는 이름을 말하고, 어린이책 편집자라고 덧붙였다. 그 말을 꺼내는 순간, 오늘 받은 메일이 다시 떠올랐다.',
      next: 'c1_13'
    },
    c1_13: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '이야기를 만드는 사람이네요. 그럼 오늘은, 어떤 이야기를 갖고 오셨어요?',
      next: 'c1_choice_honest'
    },
    c1_choice_honest: {
      bg: 'cafe', speaker: '나',
      text: '쉽게 웃어넘기려다, 이상하게 이 사람 앞에서는 솔직해지고 싶었다.',
      choices: [
        { label: '“사실… 오늘 원고가 반려됐어요. 스물일곱 번째요.”', trust: 3, next: 'c1_honest_a' },
        { label: '“그냥, 평범한 편집자예요.”', affection: 1, next: 'c1_honest_b' },
        { label: '“이야기를 만드는 사람은 아니고, 고치는 사람이에요.”', affection: 1, trust: 1, next: 'c1_honest_c' }
      ]
    },
    c1_honest_a: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '스물일곱 번째… 그럼, 스물여덟 번째도 있다는 거네요.',
      next: 'c1_honest_a2'
    },
    c1_honest_a2: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '반려는 끝이 아니라, 아직 끝나지 않았다는 뜻이잖아요. 저는 그렇게 생각해요.',
      memory: { id: 'rejection', title: '스물일곱 번째 반려', desc: '“반려는 끝이 아니라, 아직 끝나지 않았다는 뜻이잖아요.”', glyph: '✉' },
      next: 'c1_14'
    },
    c1_honest_b: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '평범한 사람이 만든 이야기가, 누군가의 하루를 바꾸기도 하잖아요. 저는 그런 게 좋아요.',
      next: 'c1_14'
    },
    c1_honest_c: {
      bg: 'cafe', speaker: '서아', expr: 'laugh',
      text: '고치는 사람. 그거 멋진데요? 별도, 처음부터 반짝이는 게 아니라 누가 빛을 찾아주는 거니까요.',
      next: 'c1_14'
    },
    c1_14: {
      bg: 'cafe', time: '금요일 · 오후 10:48', mood: 'romantic',
      narration: true,
      text: '어느새 빗소리가 잦아들었다. 카페의 작은 시계는 열한 시를 가리켰고, 컵은 오래전에 비어 있었다.',
      next: 'c1_15'
    },
    c1_15: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '오늘… 재미있었어요. 그런데 손님, 이제 가셔야죠. 저도 문 닫아야 하거든요.',
      next: 'c1_16'
    },
    c1_16: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '다음 금요일에도… 비가 오면 좋겠네요.',
      next: 'c1_17'
    },
    c1_17: {
      bg: 'cafe', time: '금요일 · 오후 11:02',
      narration: true,
      text: '계단을 내려가며 컵홀더를 발견했다. 작은 별 옆에, 동그랗게 적힌 글씨. ‘다음 금요일, 8시. – 서아’',
      memory: { id: 'first-friday', title: '다음 금요일, 8시', desc: '컵홀더에 남겨진, 아주 작은 초대.', glyph: '✧' },
      next: 'c1_end'
    },
    c1_end: {
      bg: 'rain-street', mood: 'night',
      narration: true,
      text: '집으로 가는 길, 빗방울이 하나둘 멈췄다. 우산을 접고 하늘을 올려다보니, 구름 사이로 별 하나가 보였다.',
      next: 'chapter2'
    },

    /* ───────────────────────── CHAPTER 2 ───────────────────────── */
    chapter2: {
      bg: 'cafe', chapter: 2, chapterName: '두 번째 밤', mood: 'cafe',
      time: '다음 주 금요일 · 오후 8:00',
      narration: true,
      chapterIntro: true,
      text: '다음 금요일. 비가 오지 않았는데도, 나는 그 좁은 계단을 다시 올랐다.',
      next: 'c2_1'
    },
    c2_1: {
      bg: 'cafe', speaker: '서아', expr: 'laugh',
      text: '비가 안 왔는데 오셨네요.',
      next: 'c2_2'
    },
    c2_2: {
      bg: 'cafe', speaker: '나',
      text: '약속했으니까요.',
      next: 'c2_3'
    },
    c2_3: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '…그 말, 방금 되게 좋았어요. 다시 말해주실래요?',
      next: 'c2_4'
    },
    c2_4: {
      bg: 'cafe', speaker: '나',
      text: '약속했으니까요. 서아 씨가 별을 그려준 것처럼, 저도 지키고 싶은 게 생겼어요.',
      next: 'c2_5'
    },
    c2_5: {
      bg: 'cafe', time: '금요일 · 오후 8:14',
      narration: true,
      text: '나는 가방에서 원고 한 묶음을 꺼냈다. ‘별을 삼킨 고양이’. 반려 메일을 받은, 하지만 버리지 못한 이야기.',
      memory: { id: 'manuscript', title: '별을 삼킨 고양이', desc: '반려됐지만, 그녀에게 처음 보여준 이야기.', glyph: '☾' },
      next: 'c2_6'
    },
    c2_6: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '이거… 읽어도 돼요?',
      next: 'c2_7'
    },
    c2_7: {
      bg: 'cafe', speaker: '나',
      text: '고개를 끄덕였다. 그녀가 종이를 넘기는 동안, 나는 컵의 물방울만 세고 있었다.',
      next: 'c2_8'
    },
    c2_8: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '재미있어요. 아니, 재미있는 정도가 아니라… 이 고양이, 별을 삼키고 나서 밤이 무서워진 거죠?',
      next: 'c2_9'
    },
    c2_9: {
      bg: 'cafe', speaker: '서아', expr: 'sad',
      text: '혼자 너무 밝아져서, 다른 사람의 어둠을 못 견디게 된 거예요. …조금, 제 이야기 같아서요.',
      next: 'c2_choice_read'
    },
    c2_choice_read: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '저기… 이거, 읽어주실 수 있어요? 목소리로 들으면, 이야기가 더 가까워질 것 같아서요.',
      choices: [
        { label: '“조금 서툴러도 괜찮다면.”', affection: 2, next: 'c2_read_a' },
        { label: '“대신, 서아 씨가 그림을 그려줘요. 이 이야기에.”', affection: 1, trust: 2, next: 'c2_read_b' },
        { label: '“다음엔, 완성된 원고로 읽어줄게요.”', trust: 1, affection: 1, next: 'c2_read_c' }
      ]
    },
    c2_read_a: {
      bg: 'cafe', speaker: '나',
      text: '조금 서툰 목소리로 첫 장을 읽었다. 고양이가 별을 삼키는 장면에서, 그녀가 조용히 웃었다.',
      next: 'c2_read_a2'
    },
    c2_read_a2: {
      bg: 'cafe', speaker: '서아', expr: 'laugh',
      text: '고양이 목소리가 생각보다 귀여워요. 한 장만 더… 아니, 오늘은 여기까지 할게요. 아껴둬야죠.',
      next: 'c2_10'
    },
    c2_read_b: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '제가… 그림을요? 이 이야기에?',
      next: 'c2_read_b2'
    },
    c2_read_b2: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '그럼, 제 첫 번째 독자가 되어주세요. 아니… 첫 번째 그림자가 되어주세요. 방금 한 말, 취소할래요.',
      next: 'c2_10'
    },
    c2_read_c: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '그럼 약속이네요. 완성된 원고로 읽어주기. 그때까지 저도, 그림을 완성해둘게요.',
      next: 'c2_10'
    },
    c2_10: {
      bg: 'cafe', time: '금요일 · 오후 9:20',
      speaker: '서아', expr: 'smile',
      text: '오늘은, 이 이야기에서 영감을 받은 음료를 만들어볼게요. 세 가지 중에 골라주세요.',
      next: 'c2_choice_flavor'
    },
    c2_choice_flavor: {
      bg: 'cafe', speaker: '서아',
      text: '시나몬, 유자, 자몽. 각각 다른 밤의 맛이에요.',
      choices: [
        { label: '“시나몬. 따뜻하고, 조금 위로가 되는 쪽으로요.”', affection: 1, trust: 1, next: 'c2_flavor_a' },
        { label: '“유자. 오늘처럼, 조금 밝은 쪽으로요.”', affection: 2, next: 'c2_flavor_b' },
        { label: '“자몽. 쌉싸름해야, 오래 기억에 남죠.”', trust: 2, next: 'c2_flavor_c' }
      ]
    },
    c2_flavor_a: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '좋아요. 시나몬은… 추운 밤에 문을 열고 들어온 사람에게 어울리는 맛이에요.',
      next: 'c2_11'
    },
    c2_flavor_b: {
      bg: 'cafe', speaker: '서아', expr: 'laugh',
      text: '유자요? 그럼 오늘 이 음료의 이름은 ‘유자, 별을 삼키다’로 할게요. 너무 길죠?',
      next: 'c2_11'
    },
    c2_flavor_c: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '자몽… 어렵네요. 대부분은 달콤한 걸 고르시는데.',
      next: 'c2_flavor_c2'
    },
    c2_flavor_c2: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '저도 그래요. 오래 남는 건, 조금 쓴 쪽이더라고요.',
      next: 'c2_11'
    },
    c2_11: {
      bg: 'cafe', time: '금요일 · 오후 9:51', mood: 'romantic',
      narration: true,
      text: '그녀가 컵을 내려놓으며 손끝을 살짝 데었다. “괜찮아요”라는 말보다 먼저, 내 손이 그녀의 손등으로 갔다.',
      next: 'c2_12'
    },
    c2_12: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '…손, 따뜻하네요. 손님은 추운 사람인 줄 알았는데.',
      next: 'c2_13'
    },
    c2_13: {
      bg: 'cafe', speaker: '나',
      text: '나도 그런 줄 알았어요. 그런데 요즘은, 조금씩 따뜻해지는 것 같아요.',
      next: 'c2_14'
    },
    c2_14: {
      bg: 'cafe', speaker: '서아', expr: 'sad',
      text: '저… 사실, 서울에 있는 그림 학교에 지원했어요. 다음 달에 면접이 있어요.',
      next: 'c2_15'
    },
    c2_15: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '합격하면 1년 동안 서울에서 공부해야 해요. 이 카페도… 곧 주인을 찾아야 하고요.',
      next: 'c2_choice_comfort'
    },
    c2_choice_comfort: {
      bg: 'cafe', speaker: '나',
      text: '그녀의 목소리가 평소보다 조금 작았다. 나는 어떤 말이 위로가 될지, 어떤 말이 욕심인지 생각했다.',
      choices: [
        { label: '“무서운 게 당연해요. 그래도 서아 씨 그림은 좋으니까요.”', affection: 1, trust: 2, next: 'c2_comfort_a' },
        { label: '“그럼, 제가 첫 번째 독자가 되어줄게요. 어디에 있든.”', affection: 2, trust: 1, next: 'c2_comfort_b' },
        { label: '“실패해도 괜찮아요. 다시 그리면 되니까.”', affection: 1, trust: 1, next: 'c2_comfort_c' }
      ]
    },
    c2_comfort_a: {
      bg: 'cafe', speaker: '서아', expr: 'sad',
      text: '제 그림이… 좋은지, 사실 잘 모르겠어요. 그런 말 들으면, 자꾸 울고 싶어져서.',
      next: 'c2_comfort_a2'
    },
    c2_comfort_a2: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '그래도… 고마워요. 오늘은 그 말로, 조금 버텨볼게요.',
      next: 'c2_16'
    },
    c2_comfort_b: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '어디에 있든… 그런 말, 함부로 하면 안 돼요.',
      next: 'c2_comfort_b2'
    },
    c2_comfort_b2: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '저, 진짜로 믿어버릴 거예요. 각오하세요.',
      next: 'c2_16'
    },
    c2_comfort_c: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '다시 그리면 된다… 맞네요. 저는 실패하는 게 무서운 게 아니라, 아무것도 못 그리게 되는 게 무서운 거였어요.',
      next: 'c2_16'
    },
    c2_16: {
      bg: 'cafe', time: '금요일 · 오후 10:32',
      narration: true,
      text: '그때 창밖에서 빗방울 소리가 났다. 오늘은 예보에 없던 비였다. 서아가 창가로 고개를 돌렸다.',
      next: 'c2_17'
    },
    c2_17: {
      bg: 'cafe', speaker: '서아', expr: 'laugh',
      text: '비가 왔네요. 이제 진짜… 우산이 필요하겠어요.',
      next: 'c2_choice_umbrella'
    },
    c2_choice_umbrella: {
      bg: 'cafe', speaker: '나',
      text: '가방 안에는 작은 접이식 우산 하나. 그녀의 어깨는, 우산 하나로는 조금 부족해 보였다.',
      choices: [
        { label: '“같이 우산 쓰고 걸어요. 집까지 데려다줄게요.”', affection: 2, trust: 1, next: 'c2_umbrella_a' },
        { label: '“우산 드릴게요. 저는 뛰어서 갈게요.”', affection: 1, trust: 2, next: 'c2_umbrella_b' },
        { label: '“택시 불러드릴게요. 감기 걸리면 안 되니까요.”', trust: 1, affection: 1, next: 'c2_umbrella_c' }
      ]
    },
    c2_umbrella_a: {
      bg: 'rain-street', mood: 'romantic', time: '금요일 · 오후 10:41',
      narration: true,
      text: '작은 우산 아래, 두 사람의 어깨가 닿을 듯 말 듯했다. 그녀가 내 쪽으로 조금, 아주 조금 다가왔다.',
      next: 'c2_walk'
    },
    c2_umbrella_b: {
      bg: 'rain-street', mood: 'night', time: '금요일 · 오후 10:41',
      narration: true,
      text: '우산을 쥐여주고 비 속으로 뛰어들었다. 등 뒤에서 “도윤 씨!” 하고 부르는 소리가 들렸지만, 돌아보면 젖은 얼굴이 들킬 것 같았다.',
      next: 'c2_text'
    },
    c2_umbrella_c: {
      bg: 'rain-street', mood: 'night', time: '금요일 · 오후 10:41',
      narration: true,
      text: '택시가 도착했다. 문을 닫기 전, 그녀가 창문을 내리고 손을 흔들었다. “오늘, 정말 고마웠어요.”',
      next: 'c2_text'
    },
    c2_walk: {
      bg: 'rain-street', speaker: '서아', expr: 'shy', mood: 'romantic',
      text: '저기… 우산, 조금 작지 않아요?',
      next: 'c2_walk2'
    },
    c2_walk2: {
      bg: 'rain-street', speaker: '나',
      text: '괜찮아요. 이 정도면, 충분히 넓어요.',
      next: 'c2_walk3'
    },
    c2_walk3: {
      bg: 'rain-street', speaker: '서아', expr: 'smile',
      text: '…거짓말. 어깨 다 젖었으면서.',
      next: 'c2_endline'
    },
    c2_text: {
      bg: 'rain-street', time: '금요일 · 오후 11:18',
      narration: true,
      text: '집에 도착하자마자 문자가 왔다. “오늘 우산, 고마워요. 다음엔… 같이 맞아요.”',
      next: 'c2_endline'
    },
    c2_endline: {
      bg: 'rain-street', speaker: '서아', expr: 'smile', mood: 'romantic',
      text: '다음 금요일에도… 와주실 거죠?',
      memory: { id: 'umbrella', title: '우산 아래', desc: '비가 와서 다행이라고, 처음으로 생각한 밤.', glyph: '☂' },
      next: 'c2_end'
    },
    c2_end: {
      bg: 'rain-street', narration: true,
      text: '그날 밤, 나는 우산을 펼쳐놓고 오래 말랐다. 젖은 천에서 비 냄새가 났다. 그리고 이상하게, 웃음이 났다.',
      next: 'chapter3'
    },

    /* ───────────────────────── CHAPTER 3 ───────────────────────── */
    chapter3: {
      bg: 'cafe', chapter: 3, chapterName: '세 번째 밤', mood: 'romantic',
      time: '세 번째 금요일 · 오후 7:40',
      narration: true,
      chapterIntro: true,
      text: '세 번째 금요일. 카페 문에는 ‘오늘은 일찍 닫습니다’라는 종이가 붙어 있었다.',
      next: 'c3_1'
    },
    c3_1: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '오늘은… 어디 같이 가요. 제가, 티켓을 두 장 샀어요.',
      next: 'c3_2'
    },
    c3_2: {
      bg: 'cafe', speaker: '나',
      text: '티켓을 보니 ‘별의 방’이라는 천체 투영관이었다. 그녀는 티켓 끝을 조금 접었다 폈다 하고 있었다.',
      next: 'c3_choice_invite'
    },
    c3_choice_invite: {
      bg: 'cafe', speaker: '나',
      text: '그 작은 손동작이, 대답보다 먼저 마음을 말하고 있었다.',
      choices: [
        { label: '“저도, 오늘 이 말을 기다렸어요.”', affection: 2, next: 'c3_invite_a' },
        { label: '“티켓을 두 장이나요? 그럼… 데이트네요.”', affection: 1, trust: 1, next: 'c3_invite_b' },
        { label: '“좋아요. 그런데… 왜 저예요?”', trust: 2, next: 'c3_invite_c' }
      ]
    },
    c3_invite_a: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '기다렸어요…?',
      next: 'c3_invite_a2'
    },
    c3_invite_a2: {
      bg: 'cafe', speaker: '서아', expr: 'laugh',
      text: '그런 말, 이렇게 바로 해주는 사람은 처음이에요. 저, 지금 되게 웃고 있죠?',
      next: 'c3_3'
    },
    c3_invite_b: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '데, 데이트… 그렇게 말하니까, 갑자기 티켓이 무거워지네요.',
      next: 'c3_3'
    },
    c3_invite_c: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '왜냐면… 별을 좋아한다고 해서요. 아, 거짓말. 그건 핑계고요.',
      next: 'c3_invite_c2'
    },
    c3_invite_c2: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '그냥, 이 밤을 혼자 보기 아까운 사람이 있어서요.',
      next: 'c3_3'
    },
    c3_3: {
      bg: 'planetarium', mood: 'romantic', time: '세 번째 금요일 · 오후 8:30',
      narration: true,
      text: '천체 투영관의 불이 꺼지자, 둥근 천장에 별이 쏟아졌다. 도시에서는 볼 수 없는, 너무 많은 별.',
      next: 'c3_4'
    },
    c3_4: {
      bg: 'planetarium', speaker: '서아', expr: 'smile',
      text: '저 별은… 이미 죽었을지도 몰라요. 빛이 여기까지 오는 데, 수백 년이 걸리니까요.',
      next: 'c3_5'
    },
    c3_5: {
      bg: 'planetarium', speaker: '서아', expr: 'shy',
      text: '그래도 우리는 지금, 이 자리에서 빛나고 있잖아요. 조금 늦게 도착한 빛을 보고.',
      next: 'c3_6'
    },
    c3_6: {
      bg: 'planetarium', speaker: '서아', expr: 'smile',
      text: '도윤 씨는, 별을 보면 뭐가 보여요?',
      next: 'c3_choice_stars'
    },
    c3_choice_stars: {
      bg: 'planetarium', speaker: '나',
      text: '천장의 별들이 천천히 흐르고 있었다. 대답하기 전에, 내 옆의 얼굴을 보았다.',
      choices: [
        { label: '“지금, 제 옆에 있는 사람이요.”', affection: 2, next: 'c3_stars_a' },
        { label: '“아직 오지 않은 내일이요.”', affection: 1, trust: 1, next: 'c3_stars_b' },
        { label: '“그냥… 별이요. 예쁘고, 멀고, 그래서 좋아요.”', trust: 2, next: 'c3_stars_c' }
      ]
    },
    c3_stars_a: {
      bg: 'planetarium', speaker: '서아', expr: 'surprise',
      text: '…',
      next: 'c3_stars_a2'
    },
    c3_stars_a2: {
      bg: 'planetarium', speaker: '서아', expr: 'shy',
      text: '그런 대답은, 별이 다 쏟아지는 곳에서 하면 안 되는데. 심장이 너무 시끄러워서, 별 소리가 안 들려요.',
      next: 'c3_7'
    },
    c3_stars_b: {
      bg: 'planetarium', speaker: '서아', expr: 'smile',
      text: '내일이라… 좋네요. 내일의 별은, 아직 아무도 본 적이 없으니까요.',
      next: 'c3_7'
    },
    c3_stars_c: {
      bg: 'planetarium', speaker: '서아', expr: 'laugh',
      text: '정직하네요. 좋아요. 저도 별은 그냥 별이어서 좋아요. 의미를 붙이면, 조금 외로워지니까.',
      next: 'c3_7'
    },
    c3_7: {
      bg: 'planetarium', time: '세 번째 금요일 · 오후 9:20',
      speaker: '서아', expr: 'sad',
      text: '저기… 아까 말한 서울 학교. 면접, 다음 주예요.',
      next: 'c3_8'
    },
    c3_8: {
      bg: 'planetarium', speaker: '서아', expr: 'shy',
      text: '합격하면, 한 달 뒤에 떠나요. 카페도 그때까지밖에 못 있고요. …이런 말, 오늘은 하고 싶지 않았는데.',
      next: 'c3_choice_news'
    },
    c3_choice_news: {
      bg: 'planetarium', speaker: '나',
      text: '별이 쏟아지는 천장 아래에서, 우리 사이에 처음으로 ‘떠남’이라는 단어가 내려앉았다.',
      choices: [
        { label: '“잘됐네요. 서아 씨라면, 해낼 거예요.”', trust: 2, next: 'c3_news_a' },
        { label: '“가면… 보고 싶을 것 같아요.”', affection: 2, next: 'c3_news_b' },
        { label: '“여기서 계속 그림 그리면, 안 되나요?”', affection: 1, trust: 1, next: 'c3_news_c' }
      ]
    },
    c3_news_a: {
      bg: 'planetarium', speaker: '서아', expr: 'sad',
      text: '…응원, 고마워요. 그런데 지금은, 그 말이 조금 아프네요.',
      next: 'c3_news_a2'
    },
    c3_news_a2: {
      bg: 'planetarium', speaker: '서아', expr: 'smile',
      text: '미안해요. 제가 이상한 거죠. 응원받고 싶으면서, 붙잡아주길 바라는 건.',
      next: 'c3_9'
    },
    c3_news_b: {
      bg: 'planetarium', speaker: '서아', expr: 'surprise',
      text: '보고 싶을 거예요…?',
      next: 'c3_news_b2'
    },
    c3_news_b2: {
      bg: 'planetarium', speaker: '서아', expr: 'shy',
      text: '그 말만으로, 서울이 조금 덜 무서워졌어요. 이상하죠. 떠나는 건데.',
      next: 'c3_9'
    },
    c3_news_c: {
      bg: 'planetarium', speaker: '서아', expr: 'sad',
      text: '그럴 수 있으면… 얼마나 좋을까요.',
      next: 'c3_news_c2'
    },
    c3_news_c2: {
      bg: 'planetarium', speaker: '서아', expr: 'smile',
      text: '농담이에요. 그런 말 해줘서, 조금 안심했어요. 아직 저를 붙잡고 싶은 마음이 있다는 거잖아요.',
      next: 'c3_9'
    },
    c3_9: {
      bg: 'rooftop', mood: 'romantic', time: '세 번째 금요일 · 오후 10:05',
      narration: true,
      text: '투영관을 나와, 카페 옥상에 올랐다. 도시의 불빛이 발밑에 별처럼 깔려 있었다.',
      next: 'c3_10'
    },
    c3_10: {
      bg: 'rooftop', speaker: '서아', expr: 'smile',
      text: '여기, 제가 제일 좋아하는 장소예요. 손님이 없을 때마다 올라와서, 별을 그렸거든요.',
      next: 'c3_11'
    },
    c3_11: {
      bg: 'rooftop', speaker: '나',
      text: '그때, 하늘을 가로질러 빛이 떨어졌다. 아주 짧고, 아주 밝은 선.',
      next: 'c3_12'
    },
    c3_12: {
      bg: 'rooftop', speaker: '서아', expr: 'surprise',
      text: '별똥별! 소원 빌어요, 빨리!',
      next: 'c3_choice_wish'
    },
    c3_choice_wish: {
      bg: 'rooftop', speaker: '나',
      text: '눈을 감았다. 소원은, 입 밖에 내면 이루어지지 않는다고 했다. 하지만 지금은 말하고 싶었다.',
      choices: [
        { label: '“서아 씨가 웃는 일이, 더 많아지게 해주세요.”', affection: 2, trust: 1, next: 'c3_wish_a' },
        { label: '“우리가 오래, 함께 있을 수 있게 해주세요.”', affection: 2, next: 'c3_wish_b' },
        { label: '“서아 씨의 꿈이, 꼭 이루어지게 해주세요.”', affection: 1, trust: 2, next: 'c3_wish_c' }
      ]
    },
    c3_wish_a: {
      bg: 'rooftop', speaker: '서아', expr: 'shy',
      text: '그 소원… 제가 들었어요. 그럼 이루어질 때까지, 제가 웃는 걸 보여드려야겠네요.',
      next: 'c3_13'
    },
    c3_wish_b: {
      bg: 'rooftop', speaker: '서아', expr: 'surprise',
      text: '우리가… 오래.',
      next: 'c3_wish_b2'
    },
    c3_wish_b2: {
      bg: 'rooftop', speaker: '서아', expr: 'shy',
      text: '그건 소원이 아니라, 예약이네요. …좋아요. 예약, 받아둘게요.',
      next: 'c3_13'
    },
    c3_wish_c: {
      bg: 'rooftop', speaker: '서아', expr: 'sad',
      text: '제 꿈을… 제일 먼저 빌어주는 사람은 처음이에요.',
      next: 'c3_wish_c2'
    },
    c3_wish_c2: {
      bg: 'rooftop', speaker: '서아', expr: 'smile',
      text: '그 소원은, 제가 이루어도 될까요? 대신… 이루어지면, 가장 먼저 알려드릴게요.',
      next: 'c3_13'
    },
    c3_13: {
      bg: 'rooftop', time: '세 번째 금요일 · 오후 10:31', mood: 'romantic',
      narration: true,
      text: '바람이 불었다. 서아가 어깨를 움츠리자, 나는 재킷을 벗어 걸쳐주려 했다. 그런데 그녀가 먼저, 내 손을 잡았다.',
      memory: { id: 'shooting-star', title: '별이 쏟아진 밤', desc: '옥상에서, 처음으로 손을 잡은 밤.', glyph: '✦' },
      next: 'c3_14'
    },
    c3_14: {
      bg: 'rooftop', speaker: '서아', expr: 'shy',
      text: '손… 차가워요. 제가 데워드릴게요.',
      next: 'c3_15'
    },
    c3_15: {
      bg: 'rooftop', speaker: '나',
      text: '손을 잡은 채로, 우리는 한참 말이 없었다. 도시의 소음도, 별의 소리도, 그 순간만큼은 들리지 않았다.',
      next: 'c3_16'
    },
    c3_16: {
      bg: 'rooftop', speaker: '서아', expr: 'smile',
      text: '오늘 밤은… 우리 둘만의 비밀로 해줘요. 내일이 되면, 조금 용기가 필요할 테니까.',
      next: 'c3_end'
    },
    c3_end: {
      bg: 'rooftop', narration: true,
      text: '집에 돌아와 손바닥을 보았다. 아직도 그녀의 손온기가 남아 있는 것 같았다. 그 밤, 나는 오랜만에 별을 꿈꿨다.',
      next: 'chapter4'
    },

    /* ───────────────────────── CHAPTER 4 ───────────────────────── */
    chapter4: {
      bg: 'cafe', chapter: 4, chapterName: '네 번째 밤', mood: 'warm',
      time: '한 달 뒤 · 금요일 · 오후 7:20',
      narration: true,
      chapterIntro: true,
      text: '네 번째 금요일. 카페 문은 닫혀 있었고, 창가 자리에는 서아가 혼자 앉아 있었다. 테이블 위에 서울에서 온 봉투가 놓여 있었다.',
      next: 'c4_1'
    },
    c4_1: {
      bg: 'cafe', speaker: '서아', expr: 'sad',
      text: '도윤 씨… 결과, 왔어요.',
      next: 'c4_choice_ask'
    },
    c4_choice_ask: {
      bg: 'cafe', speaker: '나',
      text: '봉투는 뜯어져 있었다. 그녀의 눈은 조금 붉었고, 입꼬리는 아주 작게 올라가 있었다.',
      choices: [
        { label: '“축하해요, 서아 씨. 합격이죠?”', trust: 2, next: 'c4_ask_a' },
        { label: '“먼저 말해줘요. 어떤 결과든, 제가 여기 있을게요.”', affection: 2, next: 'c4_ask_b' },
        { label: '“표정 보니까… 알 것 같아요.”', affection: 1, trust: 1, next: 'c4_ask_c' }
      ]
    },
    c4_ask_a: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '어떻게 알았어요?',
      next: 'c4_ask_a2'
    },
    c4_ask_a2: {
      bg: 'cafe', speaker: '서아', expr: 'laugh',
      text: '…네. 합격했어요. 근데 왜 이렇게 울 것 같죠? 기쁜 일인데. 진짜 이상하네요.',
      next: 'c4_2'
    },
    c4_ask_b: {
      bg: 'cafe', speaker: '서아', expr: 'sad',
      text: '합격했어요. 그런데… 기쁘면서도, 자꾸 도윤 씨 얼굴이 떠올라서.',
      next: 'c4_2'
    },
    c4_ask_c: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '그렇게 티가 나요? …네, 합격했어요. 한 달 뒤에 떠나요.',
      next: 'c4_2'
    },
    c4_2: {
      bg: 'cafe', time: '금요일 · 오후 7:38',
      speaker: '서아', expr: 'sad',
      text: '다음 주가 이 카페에서의 마지막 금요일이에요. 그다음 주엔… 짐을 싸야 하니까.',
      next: 'c4_3'
    },
    c4_3: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '도윤 씨는… 저한테 바라는 게 있어요?',
      next: 'c4_choice_want'
    },
    c4_choice_want: {
      bg: 'cafe', speaker: '나',
      text: '대답하기 전에, 창밖을 보았다. 우리가 처음 만난 날처럼, 비는 오지 않았다.',
      choices: [
        { label: '“서아 씨가 행복하면 좋겠어요. 그게 제일 바라는 거예요.”', affection: 1, trust: 2, next: 'c4_want_a' },
        { label: '“지금처럼, 옆에 있어주면 좋겠어요.”', affection: 2, next: 'c4_want_b' },
        { label: '“바라는 게 없다고 하면, 거짓말이에요.”', affection: 1, trust: 1, next: 'c4_want_c' }
      ]
    },
    c4_want_a: {
      bg: 'cafe', speaker: '서아', expr: 'sad',
      text: '그 말… 제일 어려운 말이에요. 저는 욕심이 많은 사람이라서요.',
      next: 'c4_want_a2'
    },
    c4_want_a2: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '그래도, 그렇게 말해줘서 고마워요. 그런 사람이 곁에 있다는 게, 얼마나 큰 용기가 되는지 몰라요.',
      next: 'c4_4'
    },
    c4_want_b: {
      bg: 'cafe', speaker: '서아', expr: 'surprise',
      text: '옆에… 있어달라고요?',
      next: 'c4_want_b2'
    },
    c4_want_b2: {
      bg: 'cafe', speaker: '서아', expr: 'shy',
      text: '그럼 저, 서울 가도… 도윤 씨 옆에 있는 걸로 해도 될까요? 멀어도, 옆이라고.',
      next: 'c4_4'
    },
    c4_want_c: {
      bg: 'cafe', speaker: '서아', expr: 'smile',
      text: '역시… 정직하네요. 그런데 저도요. 바라는 게 없으면, 이렇게 아프지도 않았겠죠.',
      next: 'c4_4'
    },
    c4_4: {
      bg: 'cafe', time: '금요일 · 오후 8:10', mood: 'romantic',
      speaker: '서아', expr: 'laugh',
      text: '좋아요. 오늘은 마지막이 아니잖아요. 아직 한 번 더 남았어요. 그러니까… 지금은, 축제 보러 가요.',
      next: 'c4_5'
    },
    c4_5: {
      bg: 'festival', mood: 'festival', time: '금요일 · 오후 8:48',
      narration: true,
      text: '강변 축제는 생각보다 붐볐다. 서아는 사람들 사이에서 자꾸 뒤처졌고, 나는 자꾸 뒤를 돌아보았다.',
      next: 'c4_6'
    },
    c4_6: {
      bg: 'festival', speaker: '서아', expr: 'laugh',
      text: '도윤 씨, 손 놓치면 안 돼요. 여기 사람 많아서, 진짜로 사라질지도 몰라요.',
      next: 'c4_7'
    },
    c4_7: {
      bg: 'festival', speaker: '나',
      text: '그녀의 손을 잡았다. 손바닥이 조금 땀에 젖어 있었다. 나도 똑같았다.',
      next: 'c4_8'
    },
    c4_8: {
      bg: 'festival', time: '금요일 · 오후 9:12',
      narration: true,
      text: '사람들이 소원 등불을 하늘로 날려 보내고 있었다. 서아가 작은 등불 두 개를 사서, 하나를 내게 건넸다.',
      next: 'c4_9'
    },
    c4_9: {
      bg: 'festival', speaker: '서아', expr: 'shy',
      text: '소원은… 말하지 마요. 대신, 이 등불에 적어요. 하늘이 대신 읽어줄 거예요.',
      next: 'c4_choice_lantern'
    },
    c4_choice_lantern: {
      bg: 'festival', speaker: '나',
      text: '펜을 들었다. 하고 싶은 말은 많았지만, 종이 위에는 몇 글자밖에 적히지 않았다.',
      choices: [
        { label: '“그럼 저도 하나 빌게요. 서아 씨와 같은 하늘 아래에서.”', affection: 1, trust: 1, next: 'c4_lantern_a' },
        { label: '“제 소원은… 이미 정해놨어요.”', affection: 2, next: 'c4_lantern_b' },
        { label: '“이루어지면, 꼭 알려줘요. 그때까지는 비밀로 해요.”', trust: 1, affection: 1, next: 'c4_lantern_c' }
      ]
    },
    c4_lantern_a: {
      bg: 'festival', speaker: '서아', expr: 'smile',
      text: '같은 하늘 아래… 그거 좋네요. 그럼 우리 등불도, 조금 가까이 날아가겠네요.',
      next: 'c4_10'
    },
    c4_lantern_b: {
      bg: 'festival', speaker: '서아', expr: 'surprise',
      text: '벌써요? …저는 아직 못 정했는데.',
      next: 'c4_lantern_b2'
    },
    c4_lantern_b2: {
      bg: 'festival', speaker: '서아', expr: 'shy',
      text: '도윤 씨 소원이 뭔지, 저도 모르게 알고 싶어지네요. 안 알려주실 거죠?',
      next: 'c4_10'
    },
    c4_lantern_c: {
      bg: 'festival', speaker: '서아', expr: 'laugh',
      text: '좋아요. 그럼 약속해요. 이루어지면, 서로 제일 먼저 알려주기.',
      next: 'c4_10'
    },
    c4_10: {
      bg: 'festival', time: '금요일 · 오후 9:36', mood: 'festival',
      narration: true,
      text: '등불이 하나둘 하늘로 올라갔다. 그때, 강 건너에서 첫 불꽃이 터졌다.',
      next: 'c4_11'
    },
    c4_11: {
      bg: 'festival', narration: true,
      text: '불꽃이 터질 때마다 세상이 잠깐씩 환해졌다. 그 빛 속에서, 서아의 얼굴이 처음 만난 날보다 조금 더 가까이 있었다.',
      next: 'c4_12'
    },
    c4_12: {
      bg: 'festival', speaker: '서아', expr: 'shy',
      text: '도윤 씨. 나… 한 가지 말하고 싶은 게 있어요.',
      next: 'c4_13'
    },
    c4_13: {
      bg: 'festival', speaker: '서아', expr: 'sad',
      text: '나, 도윤 씨를 좋아해요. 아마… 첫날부터. 별을 좋아하냐고 물었을 때부터.',
      next: 'c4_14'
    },
    c4_14: {
      bg: 'festival', speaker: '서아', expr: 'shy',
      text: '그래서… 우리, 어떻게 할까요?',
      memory: { id: 'confession', title: '불꽃 아래의 고백', desc: '“나, 도윤 씨를 좋아해요. 아마… 첫날부터.”', glyph: '❤' },
      next: 'c4_choice_final'
    },
    c4_choice_final: {
      bg: 'festival', speaker: '나',
      text: '불꽃이 터지고, 어둠이 돌아오고, 또 불꽃이 터졌다. 나는 그녀의 눈을 보며, 가장 솔직한 대답을 골랐다.',
      choices: [
        { label: '“나도 같이 갈래요. 서울에서도, 별은 같은 곳에 있잖아요.”', route: 'join', flags: { finalRoute: 'join' }, next: 'final_join' },
        { label: '“기다릴게요. 매주 금요일 밤, 통화해요.”', route: 'wait', flags: { finalRoute: 'wait' }, next: 'final_wait' },
        { label: '“지금처럼만 있어요. 천천히, 우리 속도로.”', route: 'slow', flags: { finalRoute: 'slow' }, next: 'final_slow' },
        { label: '“서아 씨를… 놓아줄게요.”', route: 'letgo', flags: { finalRoute: 'letgo' }, next: 'final_letgo' }
      ]
    },

    /* ───────────────────────── FINAL ROUTES ───────────────────────── */
    final_join: {
      bg: 'festival', speaker: '서아', expr: 'surprise', mood: 'romantic',
      text: '같이… 간다고요? 정말?',
      next: 'final_join2'
    },
    final_join2: {
      bg: 'festival', speaker: '나',
      text: '서아 씨가 별을 그리는 동안, 나는 옆에서 이야기를 고칠 수 있잖아요. 그거면 충분해요.',
      next: 'final_join3'
    },
    final_join3: {
      bg: 'festival', speaker: '서아', expr: 'laugh',
      text: '바보… 그런 말, 이렇게 쉽게 하면 안 되는데. 나, 진짜로 짐 다 싸버릴 거예요.',
      next: 'final_resolve'
    },
    final_wait: {
      bg: 'festival', speaker: '서아', expr: 'sad', mood: 'romantic',
      text: '기다린다고…? 1년이나요. 저, 그렇게 오래 걸릴지도 몰라요.',
      next: 'final_wait2'
    },
    final_wait2: {
      bg: 'festival', speaker: '나',
      text: '그럼 1년이든 2년이든, 매주 금요일 밤 열한 시에 통화해요. 그 시간만큼은, 우리 둘 다 별을 보는 거예요.',
      next: 'final_wait3'
    },
    final_wait3: {
      bg: 'festival', speaker: '서아', expr: 'smile',
      text: '…좋아요. 그럼 약속. 금요일 밤 열한 시. 늦으면, 별이 다 도망가니까요.',
      next: 'final_resolve'
    },
    final_slow: {
      bg: 'festival', speaker: '서아', expr: 'shy', mood: 'romantic',
      text: '천천히… 우리 속도로.',
      next: 'final_slow2'
    },
    final_slow2: {
      bg: 'festival', speaker: '나',
      text: '서두르면, 별을 놓칠 것 같아서요. 지금 이 밤을, 조금 더 오래 기억하고 싶어요.',
      next: 'final_slow3'
    },
    final_slow3: {
      bg: 'festival', speaker: '서아', expr: 'smile',
      text: '그럼… 오늘은 여기까지. 다음 금요일에, 또 만나요. 우리답게.',
      next: 'final_resolve'
    },
    final_letgo: {
      bg: 'festival', speaker: '서아', expr: 'sad', mood: 'sad',
      text: '…놓아준다고요?',
      next: 'final_letgo2'
    },
    final_letgo2: {
      bg: 'festival', speaker: '나',
      text: '서아 씨가 더 멀리 가려면, 제가 무거워지면 안 되니까요. 그게… 지금 제가 할 수 있는 가장 다정한 일이에요.',
      next: 'final_letgo3'
    },
    final_letgo3: {
      bg: 'festival', speaker: '서아', expr: 'sad',
      text: '…알겠어요. 고마워요, 도윤 씨. 마지막까지… 다정해서.',
      next: 'final_resolve'
    },
    final_resolve: {
      bg: 'festival', narration: true, mood: 'romantic',
      text: '불꽃이 마지막으로 크게 터졌다. 우리는 그 빛이 사라질 때까지, 서로의 얼굴을 바라보았다.',
      next: 'final_resolve2'
    },
    final_resolve2: {
      bg: 'festival', narration: true,
      text: '그리고 밤이 끝나갈 무렵, 우리는 각자의 대답을 마음에 새겼다.',
      endingResolve: true
    },

    /* ───────────────────────── ENDINGS ───────────────────────── */
    e_true_1: {
      bg: 'dawn', trump: 'true', chapter: 5, chapterName: '그리고, 다섯 번째 밤', mood: 'dawn',
      time: '일 년 뒤 · 봄',
      narration: true,
      text: '일 년이라는 시간이 흐르고, 우리는 같은 책상에 마주 앉아 있었다. 창가에는 서아가 그린 별자리 도안이 가득했다.',
      next: 'e_true_2'
    },
    e_true_2: {
      bg: 'dawn', narration: true,
      text: '『별이 내리는 밤, 너와』. 표지에는 별을 품은 고양이와, 그 옆에 앉은 여자가 그려져 있었다. 우리가 함께 만든 첫 번째 책.',
      next: 'e_true_3'
    },
    e_true_3: {
      bg: 'dawn', speaker: '서아', expr: 'smile',
      text: '도윤 씨. 이 책, 우리 이야기 같지 않아요?',
      next: 'e_true_4'
    },
    e_true_4: {
      bg: 'dawn', speaker: '나',
      text: '그러니까, 우리 이야기잖아.',
      next: 'e_true_5'
    },
    e_true_5: {
      bg: 'dawn', narration: true, mood: 'romantic',
      text: '그녀가 웃었다. 처음 본 그 밤처럼, 별이 쏟아지는 얼굴로. 그리고 나는, 이번에는 그 빛을 놓치지 않기로 했다.',
      ending: 'true'
    },

    e_good_1: {
      bg: 'rooftop', trump: 'good', chapter: 5, chapterName: '같은 하늘 아래', mood: 'romantic',
      time: '몇 달 뒤 · 금요일 밤',
      narration: true,
      text: '서아는 서울로 떠났다. 우리는 서로의 속도를 존중하기로 했다. 때로는 같은 도시에서, 때로는 다른 도시에서, 같은 하늘을 보며.',
      next: 'e_good_2'
    },
    e_good_2: {
      bg: 'rooftop', narration: true,
      text: '매주 금요일 밤, 그녀가 보내온 그림 한 장이 도착했다. 이번 주의 별자리, 그리고 늘 같은 문장. “오늘도, 여기서 별이 보여요.”',
      next: 'e_good_3'
    },
    e_good_3: {
      bg: 'rooftop', speaker: '나',
      text: '나도 사진을 찍어 보냈다. 같은 시간, 다른 하늘. 하지만 사진 속 별은, 이상하게도 같은 자리에 있었다.',
      next: 'e_good_4'
    },
    e_good_4: {
      bg: 'rooftop', narration: true, mood: 'romantic',
      text: '그리고 어느 금요일, 카페 루나의 문이 다시 열렸다. “다녀왔습니다”라고 말하는 그녀의 목소리가, 1년 전과 똑같았다.',
      ending: 'good'
    },

    e_normal_1: {
      bg: 'rain-street', trump: 'normal', chapter: 5, chapterName: '다음 금요일에', mood: 'night',
      time: '1년 뒤 · 금요일',
      narration: true,
      text: '우리는 아무것도 정하지 않았다. 그저 다음 금요일에 만나기로 했다. 서아는 서울로 갔고, 우리는 가끔 안부를 묻는 사이가 되었다.',
      next: 'e_normal_2'
    },
    e_normal_2: {
      bg: 'rain-street', narration: true,
      text: '가끔 그날의 불꽃을 떠올렸다. 말하지 못한 것들이, 아직 내 안에 별처럼 남아 있었다.',
      next: 'e_normal_3'
    },
    e_normal_3: {
      bg: 'rain-street', narration: true, mood: 'romantic',
      text: '그리고 1년 뒤 금요일. 우연히 지나친 골목에서, 카페 루나의 불이 켜져 있는 것을 보았다. 창가에는 낯익은 스케치북이 놓여 있었다.',
      ending: 'normal'
    },

    e_sad_1: {
      bg: 'rain-street', trump: 'sad', chapter: 5, chapterName: '비가 그친 뒤', mood: 'sad',
      time: '2년 뒤 · 어느 서점',
      narration: true,
      text: '나는 그녀를 놓아주었다. 그리고 그 선택이 옳았는지는, 아직도 모르겠다.',
      next: 'e_sad_2'
    },
    e_sad_2: {
      bg: 'rain-street', narration: true,
      text: '2년 뒤, 서점 신간 코너에서 낯익은 그림을 발견했다. 『별을 그리는 여자』. 표지의 별자리는, 우리가 함께 본 오리온이었다.',
      next: 'e_sad_3'
    },
    e_sad_3: {
      bg: 'rain-street', narration: true,
      text: '헌정사에는 짧은 문장이 적혀 있었다. “별을 잃어버린 어느 편집자에게.”',
      next: 'e_sad_4'
    },
    e_sad_4: {
      bg: 'rain-street', speaker: '나', mood: 'sad',
      text: '책장을 덮었다. 창밖에는 비가 내리고 있었다. 그날처럼, 아주 조용히.',
      ending: 'sad'
    }
  };

  const endings = {
    true: {
      kicker: 'TRUE ENDING',
      title: '별이 내리는 밤, 너와',
      sub: '같은 별을 보던 두 사람이, 마침내 같은 책을 펼쳤습니다.',
      note: '서로의 꿈을 응원하는 마음이, 가장 밝은 별이 되었어요.',
      color: 'gold'
    },
    good: {
      kicker: 'GOOD ENDING',
      title: '같은 하늘 아래',
      sub: '조금 다른 속도로, 하지만 같은 하늘을 보며 걸어간 두 사람.',
      note: '서두르지 않아도 괜찮아요. 별은 오래 빛나니까요.',
      color: 'rose'
    },
    normal: {
      kicker: 'NORMAL ENDING',
      title: '다음 금요일에',
      sub: '끝나지 않은 이야기. 다음 금요일, 다시 만날 수 있을까요?',
      note: '어떤 밤은 대답보다 여운이 오래 남아요.',
      color: 'blue'
    },
    sad: {
      kicker: 'BITTERSWEET ENDING',
      title: '비가 그친 뒤',
      sub: '놓아준 마음도 사랑이었을까요. 비가 그친 뒤에도 별은 남아 있었습니다.',
      note: '다른 선택이었다면, 다른 밤이 기다리고 있을지도 몰라요.',
      color: 'blue'
    }
  };

  const ENDING_SCENES = {
    true: 'e_true_1',
    good: 'e_good_1',
    normal: 'e_normal_1',
    sad: 'e_sad_1'
  };

  const route = (state) => {
    const { affection, trust, flags } = state;
    const finalRoute = flags.finalRoute || 'slow';
    if (finalRoute === 'join') return (affection >= 20 && trust >= 4) ? 'true' : 'good';
    if (finalRoute === 'wait') return (affection >= 20 && trust >= 4) ? 'true' : 'normal';
    if (finalRoute === 'slow') return (affection >= 15) ? 'good' : 'normal';
    return 'sad';
  };

  window.STORY = {
    start: 'c1_1',
    scenes,
    endings,
    endingScenes: ENDING_SCENES,
    resolveEnding: route,
    maxAffection: 30,
    maxTrust: 12
  };
})();
