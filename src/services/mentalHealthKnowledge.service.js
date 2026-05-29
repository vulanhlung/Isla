const knowledgeBase = [
  {
    id: 'grounding-54321',
    triggers: ['hoang loan', 'panic', 'lo au', 'bat an', 'qua tai', 'so hai'],
    title: 'Grounding 5-4-3-2-1',
    content:
      'Khi lo âu hoặc hoảng loạn, có thể hướng người dùng quay về hiện tại bằng bài 5-4-3-2-1: nhận ra 5 thứ nhìn thấy, 4 thứ chạm được, 3 âm thanh, 2 mùi, 1 vị hoặc một hơi thở chậm.'
  },
  {
    id: 'cbt-thought-record',
    triggers: ['suy nghi', 'tu trach', 'that bai', 'vo dung', 'toi te', 'ap luc'],
    title: 'CBT nhận diện suy nghĩ',
    content:
      'Với suy nghĩ tiêu cực, hỗ trợ người dùng tách sự kiện, cảm xúc, suy nghĩ tự động, bằng chứng ủng hộ/chống lại, và một cách nhìn cân bằng hơn. Không tranh luận gay gắt với cảm xúc của họ.'
  },
  {
    id: 'sleep-basic',
    triggers: ['mat ngu', 'kho ngu', 'ngu khong ngon', 'thuc dem'],
    title: 'Vệ sinh giấc ngủ cơ bản',
    content:
      'Với khó ngủ, ưu tiên thói quen nhẹ: giờ ngủ/thức ổn định, giảm caffeine muộn, tránh màn hình sát giờ ngủ, ghi ra điều đang lo, và gặp chuyên gia nếu mất ngủ kéo dài hoặc ảnh hưởng sinh hoạt.'
  },
  {
    id: 'journaling',
    triggers: ['nhat ky', 'viet ra', 'roi boi', 'cam xuc', 'khong hieu minh'],
    title: 'Journaling cảm xúc',
    content:
      'Gợi ý viết ngắn theo cấu trúc: chuyện gì đã xảy ra, mình cảm thấy gì trong cơ thể, mình đang cần điều gì, một bước nhỏ tử tế với mình trong hôm nay là gì.'
  },
  {
    id: 'professional-help',
    triggers: ['tram cam', 'bao hanh', 'lam dung', 'ao giac', 'hoang tuong', 'khong kiem soat'],
    title: 'Khi nên gặp chuyên gia',
    content:
      'Khuyến khích gặp chuyên gia khi triệu chứng kéo dài, tăng nặng, ảnh hưởng học tập/công việc/quan hệ, có sang chấn, bạo lực, ý nghĩ tự hại, hoặc dấu hiệu mất kiểm soát thực tại.'
  }
]

const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export const retrieveMentalHealthKnowledge = (message, limit = 3) => {
  const text = normalize(message)

  const matched = knowledgeBase
    .map((item) => ({
      ...item,
      score: item.triggers.filter((trigger) => text.includes(trigger)).length
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return matched.length > 0 ? matched : knowledgeBase.slice(0, 2)
}