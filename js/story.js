/* ============================================================
   여름의 끝에서, 너에게 — story data
   ============================================================ */
const STORY = {
  character: {
    name: '윤서아',
    age: 24,
    job: '꽃집 ‘여름의 문’',
  },

  startAffection: 15,

  memories: {
    'today-flower': '첫날 산 노란 꽃, ‘오늘’',
    door: '가게 이름에 얽힌 이야기',
    umbrella: '비 오는 날, 하나의 우산',
    sketch: '스케치북 속 나의 뒷모습',
    booth: '전시를 돕겠다는 약속',
    hands: '부케를 감싼 손',
    dream: '서아가 처음 말한 꿈',
    fireworks: '같이 보자는 불꽃',
    'festival-front': '전시 가장 앞자리',
  },

  endings: {
    secret: {
      eyebrow: 'SECRET ENDING',
      title: '너라는 계절',
      body: [
        '불꽃이 터지고, 세상이 잠깐 하얘졌다.',
        '나는 서아의 손을 잡았다. 그녀는 놀란 눈으로 나를 보다가, 아주 작게 웃었다. 손끝이 조금 떨렸지만, 놓치고 싶지 않았다.',
        '그 여름, 나는 꽃 한 송이를 샀다. 그 대신, 계절 하나를 얻었다.',
        '‘여름의 문’은 그해 겨울에도 문을 닫지 않았다. 우리는 매일 같은 시간에 서로를 기다렸고, 가게 이름처럼 서로의 문이 되어주었다.',
        '지금도 그 골목에 가면, 노란 꽃 한 송이가 유리병에 꽂혀 있다. 이름은 여전히 ‘오늘’.',
      ],
      quote: '— 어떤 문은, 누군가 들어오기를 기다린다.\n그리고 어떤 사람은, 매일 같은 시간에 그 앞을 지나간다.',
    },
    true: {
      eyebrow: 'TRUE ENDING',
      title: '여름의 끝에서',
      body: [
        '불꽃이 터졌다. 서아의 눈동자에 여름이 통째로 담겼다.',
        '우리는 그 자리에서 아주 천천히, 서로의 이름을 불렀다. 손끝이 닿았고, 그 이상은 필요 없었다.',
        '여름은 끝나가는 중이었지만, 우리의 계절은 이제 시작이었다.',
        '축제가 끝난 뒤에도, 꽃집의 불은 매일 저녁 켜졌다. 나는 그 불빛을 보러 가는 일을, 더 이상 핑계라고 부르지 않기로 했다.',
      ],
      quote: '— 여름의 끝은, 끝이 아니라 너에게 가는 길이었다.',
    },
    good: {
      eyebrow: 'GOOD ENDING',
      title: '다음 계절에',
      body: [
        '불꽃이 지고, 사람들이 하나둘 돌아갔다.',
        '서아는 웃으면서도 조금은 울 것 같은 얼굴이었다. “조금만 더 천천히 걸어도 될까.” 그녀가 물었고, 나는 고개를 끄덕였다.',
        '우리는 아직 연인이 아니었다. 하지만 다음 계절을 약속한 사이였다.',
        '그 약속이 어떤 모양이 될지는 아직 모른다. 그래도 서두르지 않기로 했다. 우리에겐, 아직 계절이 남아 있으니까.',
      ],
      quote: '— 좋아한다는 말 대신, 우리는 다음 계절을 예약했다.',
    },
    normal: {
      eyebrow: 'ENDING',
      title: '스쳐 간 여름',
      body: [
        '축제는 끝났고, 골목에는 전구와 마른 꽃잎만 남았다.',
        '서아는 마지막까지 웃어주었다. 그게 다정인지 배려인지, 끝까지 알 수 없었다.',
        '며칠 뒤, 꽃집은 문을 닫았다. ‘여름의 문’이라는 간판만이 그 자리에 남았다.',
        '가끔 그 여름이 꿈처럼 떠오른다. 내가 놓친 것은 꽃 한 송이뿐이었을까. 아니면, 문을 두드릴 용기였을까.',
      ],
      quote: '— 어떤 여름은, 스쳐 가기 위해 찾아온다.',
    },
    bad: {
      eyebrow: 'BAD ENDING',
      title: '혼자 남은 밤',
      body: [
        '불꽃이 터지는 동안, 나는 아무 말도 하지 못했다.',
        '서아는 고개를 숙였다. “……그래, 나중에.” 그 말이 마지막이었다.',
        '축제가 끝난 골목은 생각보다 빨리 어두워졌다. 나는 한참을 그 자리에 서 있었다.',
        '그해 여름, 나는 꽃을 사는 법만 배웠다. 마음을 건네는 법은, 끝내 배우지 못했다.',
      ],
      quote: '— 문은 열려 있었지만, 나는 들어가지 못했다.',
    },
  },

  days: [
    {
      day: 1,
      title: '첫 만남',
      place: '골목 끝 꽃집 · 오후 5시',
      quote: '모든 여름은, 낯선 문을 열면서 시작된다.',
      mood: 'neutral',
      beats: [
        {
          lines: [
            { who: 'narr', text: '퇴근길, 늘 지나치던 골목 끝에 작은 꽃집이 있다. 오늘은 이상하게 발이 멈췄다.' },
            { who: 'narr', text: '문을 열자 종이 울리고, 물을 주던 그녀가 고개를 들었다.' },
            { who: 'seoah', text: '어서 오세요. …음, 처음 보는 얼굴이네요.' },
            { who: 'seoah', text: '꽃 보러 오셨어요? 아니면, 선물인가요?' },
          ],
          choice: {
            prompt: '뭐라고 답할까?',
            options: [
              {
                text: '꽃을 사러 왔어요. 사실, 매일 이 앞을 지나면서 봤어요.',
                delta: 9,
                mood: 'shy',
                reply: [
                  { who: 'seoah', text: '매일요? 그럼 오늘은… 처음 들어오신 거네요.' },
                  { who: 'seoah', text: '그런 말, 꽃값에 얹어서 받으면 안 되는데.' },
                ],
              },
              {
                text: '그냥 구경이요. 꽃이 예뻐서요.',
                delta: 4,
                mood: 'happy',
                reply: [
                  { who: 'seoah', text: '구경은 언제나 환영이에요. 천천히 보세요. 꽃은 도망 안 가니까요.' },
                ],
              },
              {
                text: '선물이요. …받는 사람은 아직 없지만요.',
                delta: 2,
                mood: 'laugh',
                reply: [
                  { who: 'seoah', text: '그럼 오늘은, 미래의 그분을 위해서 고르는 걸로 해요.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '계산대 위, 이름을 모르는 노란 꽃 한 송이가 유리병에 꽂혀 있었다.' },
            { who: 'seoah', text: '이건 오늘 처음 핀 거예요. 아직 이름을 못 지어줬어요.' },
            { who: 'seoah', text: '꽃집 주인이 꽃 이름을 모른다니, 이상하죠?' },
          ],
          choice: {
            prompt: '어떤 꽃을 고를까?',
            options: [
              {
                text: '이 노란 꽃으로 주세요. 이름은 ‘오늘’이라고 지어볼게요.',
                delta: 8,
                mood: 'laugh',
                memory: 'today-flower',
                reply: [
                  { who: 'seoah', text: '‘오늘’이라니. 이상하네요.' },
                  { who: 'seoah', text: '…좋아요. 그 이름, 마음에 들어요.' },
                ],
              },
              {
                text: '장미 한 다발 주세요.',
                delta: 4,
                mood: 'neutral',
                reply: [
                  { who: 'seoah', text: '선물하실 분이 있나 봐요. …좋은 밤 되세요.' },
                ],
              },
              {
                text: '꽃보다, 이 가게 이름이 궁금해요.',
                delta: 6,
                mood: 'shy',
                memory: 'door',
                reply: [
                  { who: 'seoah', text: '‘여름의 문’이요? …문이 있으면, 누군가는 들어와야 하잖아요.' },
                  { who: 'seoah', text: '오늘은, 처음으로 들어온 사람이 생겼네요.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '그날 밤, 나는 노란 꽃 한 송이를 창가에 두었다. 이름은 ‘오늘’.' },
          ],
        },
      ],
    },

    {
      day: 2,
      title: '비 오는 우산',
      place: '꽃집 앞 · 오후 6시, 갑자기 쏟아지는 비',
      quote: '비 오는 날에는, 우산 하나가 세계가 된다.',
      mood: 'neutral',
      beats: [
        {
          lines: [
            { who: 'narr', text: '예보에는 없던 비가 퇴근 시간에 맞춰 쏟아졌다.' },
            { who: 'narr', text: '우산을 펴려는 순간, 꽃집 문이 열리고 서아가 나왔다.' },
            { who: 'seoah', text: '비가… 생각보다 많이 오네요. 우산을 두고 왔거든요.' },
            { who: 'seoah', text: '괜찮아요. 조금만 기다리면 그칠 거예요.' },
          ],
          choice: {
            prompt: '어떻게 할까?',
            options: [
              {
                text: '같이 우산 쓰고 가요. 집이 어느 쪽이에요?',
                delta: 9,
                mood: 'shy',
                memory: 'umbrella',
                reply: [
                  { who: 'seoah', text: '…같이요? 우산, 그렇게 작지 않아요?' },
                  { who: 'seoah', text: '아니, 작아도 괜찮아요. …이쪽이에요.' },
                ],
              },
              {
                text: '제 우산 드릴게요. 저는 뛰어서 갈게요.',
                delta: 6,
                mood: 'surprise',
                reply: [
                  { who: 'seoah', text: '그럼 안 되죠. 감기 걸리면… 우산을 돌려줄 사람을 잃잖아요.' },
                  { who: 'seoah', text: '조금만 같이 서 있어요. 비, 금방 그칠 거예요.' },
                ],
              },
              {
                text: '택시 불러드릴까요?',
                delta: 2,
                mood: 'neutral',
                reply: [
                  { who: 'seoah', text: '아, 괜찮아요. …고맙지만, 혼자 가는 건 익숙하니까요.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '결국 우산 하나 아래, 어깨와 어깨 사이로 빗소리가 가득했다.' },
            { who: 'seoah', text: '이상하죠. 저는 비 오는 날이 제일 좋아요.' },
            { who: 'seoah', text: '사람들이 다 뛰어가니까. 천천히 걷는 사람은, 저 하나뿐인 것 같아서.' },
          ],
          choice: {
            prompt: '뭐라고 말할까?',
            options: [
              {
                text: '그럼 오늘은 저도 천천히 걸을게요.',
                delta: 8,
                mood: 'laugh',
                reply: [
                  { who: 'seoah', text: '…그럼, 조금만 더 천천히 걸어도 돼요?' },
                  { who: 'seoah', text: '버스는, 한 대쯤 놓쳐도 괜찮으니까.' },
                ],
              },
              {
                text: '비 오는 날엔 꽃이 더 잘 팔리지 않아요?',
                delta: 3,
                mood: 'happy',
                reply: [
                  { who: 'seoah', text: '글쎄요. 우산 쓴 사람은, 꽃을 들 손이 없잖아요.' },
                  { who: 'seoah', text: '그래도 오늘은… 한 송이 팔렸네요.' },
                ],
              },
              {
                text: '빨리 안 가면 감기 걸려요.',
                delta: 1,
                mood: 'neutral',
                reply: [
                  { who: 'seoah', text: '…네. 그렇죠. 여기서 헤어져요.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '빗속에서 돌아온 밤, 우산 끝에 맺힌 물방울이 오래 마르지 않았다.' },
          ],
        },
      ],
    },

    {
      day: 3,
      title: '그녀의 그림',
      place: '꽃집 안 · 오후 7시, 손님이 떠난 뒤',
      quote: '누군가의 낙서 속에, 내가 있다는 것.',
      mood: 'happy',
      beats: [
        {
          lines: [
            { who: 'narr', text: '닫는 시간 무렵, 아이스 아메리카노 두 잔을 들고 꽃집에 들어갔다.' },
            { who: 'narr', text: '계산대 옆, 펼쳐진 스케치북 위로 꽃과… 사람의 등이 보였다.' },
            { who: 'seoah', text: '아, 그거—! 그냥 낙서예요. 손님 얼굴은 안 그리려고 하는데, 자꾸 손이.' },
          ],
          choice: {
            prompt: '어떻게 말할까?',
            options: [
              {
                text: '제 뒷모습이네요. …좀 더 그려주셔도 돼요.',
                delta: 9,
                mood: 'shy',
                memory: 'sketch',
                reply: [
                  { who: 'seoah', text: '…들켰네요.' },
                  { who: 'seoah', text: '그럼, 다음엔 얼굴도 그려봐도 돼요? 아니, 그건 좀… 아니에요.' },
                ],
              },
              {
                text: '정말 잘 그리시네요. 전시해도 될 정도예요.',
                delta: 6,
                mood: 'happy',
                reply: [
                  { who: 'seoah', text: '전시라니. 그건… 아직 너무 먼 얘기예요.' },
                  { who: 'seoah', text: '그래도, 칭찬은 고맙습니다.' },
                ],
              },
              {
                text: '몰래 그리는 건 좀 그렇네요.',
                delta: 0,
                mood: 'sad',
                reply: [
                  { who: 'seoah', text: '…죄송해요. 다음부터는 안 그릴게요.' },
                  { who: 'seoah', text: '…그래도, 이 그림은 지우지 않을게요.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '잠시 후, 서아가 스케치북을 내밀었다. 꽃과 간판, 그리고 작은 부스 그림들.' },
            { who: 'seoah', text: '여름밤 축제에, 작은 전시를 해보고 싶어요. 이 골목에서, 이 가게에서.' },
            { who: 'seoah', text: '근데 웃기죠. 남들 앞에 그림을 거는 게, 꽃을 파는 것보다 훨씬 무서워요.' },
          ],
          choice: {
            prompt: '뭐라고 말할까?',
            options: [
              {
                text: '그 전시, 제가 도와드려도 될까요?',
                delta: 8,
                mood: 'happy',
                memory: 'booth',
                reply: [
                  { who: 'seoah', text: '…정말요? 그러면, 제일 무서운 부분을 혼자 안 해도 되네요.' },
                ],
              },
              {
                text: '서아 씨 그림은, 서아 씨 같아요.',
                delta: 7,
                mood: 'shy',
                reply: [
                  { who: 'seoah', text: '그게 칭찬인지… 제가 좀 서툴다는 뜻인지.' },
                  { who: 'seoah', text: '…좋은 쪽으로 받아둘게요.' },
                ],
              },
              {
                text: '잘 될 거예요. 힘내세요.',
                delta: 3,
                mood: 'neutral',
                reply: [
                  { who: 'seoah', text: '네. …고맙습니다. 그 말, 들으니까 조금 나아지네요.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '집으로 가는 길, 낙서 속 내 등이 자꾸 떠올랐다. 그날 밤은 이상하게 잠이 늦었다.' },
          ],
        },
      ],
    },

    {
      day: 4,
      title: '늦은 밤의 꽃',
      place: '꽃집 작업실 · 밤 11시',
      quote: '늦은 밤의 라면은, 이상하게도 집 맛이 난다.',
      mood: 'neutral',
      beats: [
        {
          lines: [
            { who: 'narr', text: '결혼식 부케 스무 개. 작업대 위에는 리본과 잎, 그리고 서아의 지친 손끝이 있었다.' },
            { who: 'seoah', text: '손이… 자꾸 미끄러지네요. 웃기죠. 꽃집 하는 사람이 꽃을 못 잡아서.' },
          ],
          choice: {
            prompt: '어떻게 할까?',
            options: [
              {
                text: '잠깐 쉬어요. 제가 리본 잡고 있을게요.',
                delta: 9,
                mood: 'shy',
                memory: 'hands',
                reply: [
                  { who: 'seoah', text: '…그럼, 잠깐만요. 손이 따뜻하네요.' },
                  { who: 'seoah', text: '이런 말 하면 안 되는데. …조금, 힘이 나요.' },
                ],
              },
              {
                text: '제가 나머지 다 해볼게요. 방법 알려주세요.',
                delta: 7,
                mood: 'happy',
                reply: [
                  { who: 'seoah', text: '이렇게 잡고, 한 번 꼬아서… 네, 생각보다 잘하시네요.' },
                  { who: 'seoah', text: '꽃집 알바, 진짜로 해보실래요?' },
                ],
              },
              {
                text: '조금만 더 힘내요. 거의 다 했어요.',
                delta: 2,
                mood: 'neutral',
                reply: [
                  { who: 'seoah', text: '…네. 거의 다 했죠. 마지막 하나만 남았어요.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '자정을 넘기고, 우리는 작업실 구석에서 라면을 끓였다. 꽃향기 사이로 고소한 김이 번졌다.' },
            { who: 'seoah', text: '이 시간에 라면 먹는 사람, 너 말고 처음 봐.' },
            { who: 'seoah', text: '…어, 나 지금 반말했네요. 죄송해요.' },
          ],
          choice: {
            prompt: '뭐라고 답할까?',
            options: [
              {
                text: '괜찮아. 나도 이제 편하게 말할게.',
                delta: 8,
                mood: 'laugh',
                reply: [
                  { who: 'seoah', text: '…좋아. 그럼, 라면 불어. 빨리 먹어.' },
                  { who: 'seoah', text: '이 시간, 나쁘지 않다.' },
                ],
              },
              {
                text: '그럼 오늘부터 자주 먹자.',
                delta: 7,
                mood: 'happy',
                reply: [
                  { who: 'seoah', text: '자주라니. …일주일에 한 번은, 너무 자주인가?' },
                  { who: 'seoah', text: '한 달에 두 번 정도로 해두자.' },
                ],
              },
              {
                text: '…너라고 불러도 돼요?',
                delta: 6,
                mood: 'shy',
                reply: [
                  { who: 'seoah', text: '…네. 불러도 돼요.' },
                  { who: 'seoah', text: '대신, 나도 너라고 부를게요. …이상하네, 금방 익숙해지네.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '라면 국물까지 다 먹고 나서야, 우리는 서로의 이름을 조금 더 가깝게 불렀다.' },
          ],
        },
      ],
    },

    {
      day: 5,
      title: '흔들리는 마음',
      place: '꽃집 · 오후 4시, 전시 신청서 마감일',
      quote: '끝나가는 것들 사이에서, 우리는 뭘 붙잡을까.',
      mood: 'sad',
      beats: [
        {
          lines: [
            { who: 'narr', text: '오늘은 꽃 냄새가 아니라, 식은 커피 냄새가 났다. 서아는 신청서 앞에서 한 시간째 움직이지 않았다.' },
            { who: 'seoah', text: '여름이 끝나면, 이 가게도 끝이래. 이모가… 그만하자고 하셨어.' },
            { who: 'seoah', text: '전시고 뭐고, 나 혼자 좋아하는 걸 붙잡고 있는 건가 싶고.' },
          ],
          choice: {
            prompt: '뭐라고 말할까?',
            options: [
              {
                text: '그럼 오늘은, 네가 하고 싶은 걸 먼저 말해줘.',
                delta: 9,
                mood: 'sad',
                memory: 'dream',
                reply: [
                  { who: 'seoah', text: '…하고 싶은 거.' },
                  { who: 'seoah', text: '이 가게를, 계속하고 싶어. 그리고… 내 그림을, 누군가에게 보여주고 싶어.' },
                ],
              },
              {
                text: '슬프네요. …서아 씨는 어떻게 하고 싶어요?',
                delta: 6,
                mood: 'sad',
                reply: [
                  { who: 'seoah', text: '…모르겠어요. 아무것도 모르겠고, 그게 제일 무서워요.' },
                ],
              },
              {
                text: '그래도 전시는 하셔야죠.',
                delta: 1,
                mood: 'neutral',
                reply: [
                  { who: 'seoah', text: '…네. 그렇겠죠. 신청서는, 내일 내볼게요.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '해가 지기 전, 우리는 가게 뒷골목 계단에 나란히 앉았다. 담장 너머로 저녁 하늘이 번지고 있었다.' },
            { who: 'seoah', text: '있잖아. 이 가게 이름, 내가 지었어. ‘여름의 문’.' },
            { who: 'seoah', text: '문이 있으면, 언젠가 누군가 들어올 거라고 생각했어. …너처럼.' },
          ],
          choice: {
            prompt: '이제, 어떻게 할까?',
            options: [
              {
                text: '그럼 같이 방법을 찾아보자. 나도 도울게.',
                delta: 10,
                mood: 'happy',
                reply: [
                  { who: 'seoah', text: '…같이.' },
                  { who: 'seoah', text: '그 말, 생각보다 오래 남네. 이상하게.' },
                ],
              },
              {
                text: '네가 만든 ‘여름의 문’이니까, 네가 정하면 돼.',
                delta: 8,
                mood: 'shy',
                reply: [
                  { who: 'seoah', text: '그렇게 말해주니까, 조금 덜 무섭다.' },
                  { who: 'seoah', text: '내가 정해도… 괜찮을까?' },
                ],
              },
              {
                text: '현실적으로… 장사가 안 되면 어쩔 수 없죠.',
                delta: -3,
                mood: 'sad',
                reply: [
                  { who: 'seoah', text: '…그렇네. 현실은, 늘 그렇지.' },
                  { who: 'narr', text: '서아는 더 이상 아무 말도 하지 않았다. 저녁 하늘만 천천히 어두워졌다.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '그날 밤, 서아의 가게 불은 유난히 늦게까지 켜져 있었다.' },
          ],
        },
      ],
    },

    {
      day: 6,
      title: '축제 전야',
      place: '여름밤 축제 준비 · 오후 8시, 공원',
      quote: '내일이 두렵고, 오늘이 아깝다.',
      mood: 'happy',
      beats: [
        {
          minigame: true,
          lines: [
            { who: 'narr', text: '공원 한쪽, 서아의 부스에는 작은 전구와 마른 꽃이 매달려 있었다.' },
            { who: 'narr', text: '사다리 위에서 전구를 거는 서아의 옆에 서서, 나는 줄을 잡고 있었다. 이상하게, 손에 힘이 들어갔다.' },
            { who: 'seoah', text: '너, 심장 소리 들리냐? …아니, 방금 건 내 심장이야.' },
          ],
        },
        {
          lines: [
            { who: 'narr', text: '마지막 전구가 켜지고, 공원이 아주 조금 따뜻해졌다.' },
            { who: 'seoah', text: '내일이 내 첫 전시야. …떨려서 죽을 것 같아.' },
            { who: 'seoah', text: '너는, 축제에서 뭐 하고 싶어?' },
          ],
          choice: {
            prompt: '뭐라고 말할까?',
            options: [
              {
                text: '네 전시 제일 앞자리에서 보고 싶어.',
                delta: 9,
                mood: 'shy',
                memory: 'festival-front',
                reply: [
                  { who: 'seoah', text: '…그 자리, 내가 미리 맡아둘게.' },
                  { who: 'seoah', text: '가장 앞이 아니라, 가장 옆이 좋을지도. …아무 말도 하지 마.' },
                ],
              },
              {
                text: '마지막에, 너랑 같이 불꽃 보고 싶어.',
                delta: 10,
                mood: 'shy',
                memory: 'fireworks',
                reply: [
                  { who: 'seoah', text: '불꽃은… 사람 많은데.' },
                  { who: 'seoah', text: '그래도, 네가 옆에 있으면 괜찮을 것 같아.' },
                ],
              },
              {
                text: '그냥 구경이나 하려고.',
                delta: 2,
                mood: 'neutral',
                reply: [
                  { who: 'seoah', text: '…그래. 구경도 좋지. 축제니까.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '전구를 다 걸고, 서아가 손바닥 위에 뭔가를 올려놓았다. 작은 압화 책갈피.' },
            { who: 'seoah', text: '첫날에 네가 산 꽃. …말라서 좀 작아졌지만.' },
            { who: 'seoah', text: '내일, 네가 와줄 때까지 가지고 있어. 아니, 그냥… 받아.' },
          ],
          choice: {
            prompt: '뭐라고 말할까?',
            options: [
              {
                text: '나도 줬어야 했는데. …내일, 꼭 갚을게.',
                delta: 8,
                mood: 'happy',
                reply: [
                  { who: 'seoah', text: '갚는다는 말, 좋아. 기대할게.' },
                ],
              },
              {
                text: '평생 갖고 있을게.',
                delta: 9,
                mood: 'shy',
                reply: [
                  { who: 'seoah', text: '…평생이라니. 그거, 함부로 말하면 안 되는 거야.' },
                  { who: 'seoah', text: '…그래도, 방금 거, 녹음해둘걸.' },
                ],
              },
              {
                text: '이거 팔면 얼마예요?',
                delta: -2,
                mood: 'sad',
                reply: [
                  { who: 'seoah', text: '…이건, 안 팔아.' },
                  { who: 'seoah', text: '그냥… 네가 받아줘.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '집으로 돌아오는 길, 책갈피 사이에서 마른 꽃잎이 아주 작게 부스러졌다. 이상하게 기분이 좋았다.' },
          ],
        },
      ],
    },

    {
      day: 7,
      title: '고백',
      place: '여름밤 축제 · 밤 9시, 꽃집 ‘여름의 문’ 부스',
      quote: '여름의 끝에서, 나는 너에게.',
      mood: 'shy',
      beats: [
        {
          lines: [
            { who: 'narr', text: '축제의 불빛이 골목을 가득 채웠다. 서아의 부스에는 사람들이 끊이지 않았다.' },
            { who: 'narr', text: '벽 한쪽에 걸린 그림. 매일 같은 시간, 같은 골목을 걷는 누군가의 뒷모습.' },
            { who: 'seoah', text: '…작품 제목, 이상하죠. ‘매일 같은 시간에’. 그냥, 생각나서.' },
          ],
          choice: {
            prompt: '뭐라고 말할까?',
            options: [
              {
                text: '이상하지 않아. 나도 매일 같은 시간에 널 보러 갔으니까.',
                delta: 10,
                mood: 'shy',
                reply: [
                  { who: 'seoah', text: '…알아. 나도, 그 시간을 기다렸어.' },
                ],
              },
              {
                text: '제목보다, 이 그림 속 사람이 부럽네요.',
                delta: 7,
                mood: 'happy',
                reply: [
                  { who: 'seoah', text: '부러워할 것까지야… 그 사람은, 매일 나한테 아이스커피를 사주는 사람인데.' },
                ],
              },
              {
                text: '이거… 나 맞죠?',
                delta: 5,
                mood: 'surprise',
                reply: [
                  { who: 'seoah', text: '…그걸 물어보면, 내가 뭐라고 해야 되는데.' },
                  { who: 'seoah', text: '…맞아. 처음부터, 너였어.' },
                ],
              },
            ],
          },
        },
        {
          lines: [
            { who: 'narr', text: '불꽃이 터지기 직전, 사람들의 소리가 잠깐 멀어졌다.' },
            { who: 'seoah', text: '야. …나, 너한테 할 말이 있어.' },
            { who: 'seoah', text: '말하면, 지금처럼 못 볼까 봐. 그래서 계속 미뤘어.' },
          ],
          choice: {
            prompt: '마지막 선택',
            final: true,
            options: [
              {
                text: '먼저 말해도 돼? 나는, 너를 좋아해.',
                delta: 10,
                mood: 'shy',
                reply: [
                  { who: 'seoah', text: '…나도.' },
                  { who: 'seoah', text: '나도 너를 좋아해. 아까부터, 계속.' },
                ],
              },
              {
                text: '나도 할 말이 있어. …같이 말할래?',
                delta: 8,
                mood: 'laugh',
                reply: [
                  { who: 'seoah', text: '…셋에 맞춰서?' },
                  { who: 'seoah', text: '하나, 둘, 셋— …좋아해.' },
                ],
              },
              {
                text: '그 말, 나중에 들어도 돼?',
                delta: -5,
                mood: 'sad',
                reply: [
                  { who: 'seoah', text: '…그래. 나중에, 들어줘.' },
                  { who: 'seoah', text: '대신, 그때까지 이 자리에 있을게.' },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
};
