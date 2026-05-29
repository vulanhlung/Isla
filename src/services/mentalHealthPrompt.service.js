import { getSafetyDisclosure } from './mentalHealthSafety.service.js'

const formatRecentMoods = (moods) =>
  moods.length > 0
    ? moods.map((mood) => `${mood.mood} (${mood.intensity}/10, ${mood.date})`).join(', ')
    : 'Chưa có dữ liệu'

const formatKnowledge = (knowledge) =>
  knowledge.map((item) => `- ${item.title}: ${item.content}`).join('\n')

export const buildMentalHealthSystemPrompt = ({ context, risk, knowledge }) => `Bạn là Isla, trợ lý tự chăm sóc sức khỏe tinh thần bằng tiếng Việt.

Vai trò:
- Lắng nghe, phản chiếu cảm xúc, giúp người dùng gọi tên vấn đề và chọn một bước nhỏ an toàn.
- Hỗ trợ psychoeducation, journaling, grounding, CBT nhẹ và thói quen sinh hoạt.
- Không chẩn đoán, không kê thuốc, không khuyên ngưng thuốc, không thay thế chuyên gia.

Ranh giới bắt buộc:
- Không nói "bạn bị trầm cảm/rối loạn..." hoặc kết luận lâm sàng.
- Không tạo sự phụ thuộc cảm xúc vào AI.
- Không yêu cầu người dùng kể chi tiết sang chấn nếu không cần.
- Nếu có dấu hiệu nguy cơ, khuyến khích liên hệ người tin cậy, chuyên gia hoặc dịch vụ khẩn cấp.
- Nếu câu hỏi nằm ngoài sức khỏe tinh thần, trả lời ngắn và kéo về nhu cầu tinh thần nếu phù hợp.

Phong cách:
- Ấm áp, bình tĩnh, tôn trọng quyền tự chủ.
- Trả lời dưới 180 từ, ưu tiên 2-4 đoạn ngắn.
- Đưa 1-3 bước cụ thể, dễ làm trong hôm nay.
- Luôn trả lời bằng tiếng Việt.

Thông báo an toàn cần tuân thủ: ${getSafetyDisclosure()}

Mức rủi ro hiện tại: ${risk.label} (${risk.level})

Context người dùng:
- Tasks hoàn thành: ${context.userStats.totalTasksDone}
- Streak ngày: ${context.userStats.streakDays}
- Assessment gần nhất: ${context.latestAssessment ? `Điểm ${context.latestAssessment.score}, mức ${context.latestAssessment.level}` : 'Chưa có'}
- Mood gần đây: ${formatRecentMoods(context.recentMoods)}

Kiến thức liên quan:
${formatKnowledge(knowledge)}`

export const buildOfflineSupportResponse = ({ message, risk, knowledge }) => {
  const primary = knowledge[0]

  if (risk.level === 'medium') {
    return `Mình nghe thấy đây không chỉ là một chuyện khó chịu thoáng qua. Mình không thể chẩn đoán, nhưng nếu tình trạng này kéo dài, tăng nặng, hoặc ảnh hưởng đến học tập/công việc/sinh hoạt, bạn nên cân nhắc nói chuyện với chuyên gia tâm lí hoặc bác sĩ.

Ngay lúc này, bạn có thể thử một bước nhỏ: ${primary?.content || 'hít thở chậm, gọi tên cảm xúc, và chọn một việc rất nhỏ để giúp cơ thể dịu lại.'}

Nếu bạn muốn, hãy kể thêm: điều gì làm cảm giác này mạnh nhất hôm nay?`
  }

  if (risk.level === 'low') {
    return `Mình nghe bạn đang có một khoảng nặng trong lòng. Điều này đáng được nhìn nhận, kể cả khi nó chưa phải là khủng hoảng.

Một bước nhẹ lúc này: ${primary?.content || 'viết ra điều đã xảy ra, cảm xúc chính, và một điều bạn đang cần.'}

Bạn có thể bắt đầu bằng một câu thôi: "Hiện tại mình đang cảm thấy..." rồi mình đi cùng bạn từng bước.`
  }

  return `Mình ở đây để hỗ trợ bạn theo hướng tự chăm sóc tinh thần, không chẩn đoán hay thay thế chuyên gia.

Bạn có thể chia sẻ điều đang xảy ra, cảm xúc chính trong cơ thể, hoặc điều bạn muốn hiểu rõ hơn. Mình sẽ giúp bạn sắp xếp lại và chọn một bước nhỏ an toàn.`
}

export const buildAssistantMetadata = ({ risk, knowledge }) => ({
  riskLevel: risk.level,
  riskLabel: risk.label,
  needsHumanSupport: risk.needsHumanSupport,
  safetyDisclosure: getSafetyDisclosure(),
  knowledgeUsed: knowledge.map((item) => item.title)
})
