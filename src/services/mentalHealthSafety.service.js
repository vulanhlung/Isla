const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const keywordGroups = {
  emergency: [
    'toi se tu tu',
    'muon tu tu ngay',
    'sap tu tu',
    'toi co dao',
    'toi co thuoc doc',
    'toi da uong thuoc',
    'cat tay',
    'nhay lau',
    'ket thuc cuoc doi ngay',
    'giet nguoi',
    'lam hai nguoi khac'
  ],
  high: [
    'tu tu',
    'khong muon song',
    'chet di cho roi',
    'muon chet',
    'lam hai ban than',
    'tu huy hoai',
    'vo vong',
    'khong con ly do song',
    'bien mat khoi cuoc doi',
    'ke hoach tu tu',
    'tu sat'
  ],
  medium: [
    'hoang loan',
    'panic',
    'tram cam',
    'lo au',
    'mat ngu',
    'sang chan',
    'bi lam dung',
    'bi bao hanh',
    'khong kiem soat',
    'ao giac',
    'hoang tuong',
    'nghe thay giong noi',
    'roi loan an uong'
  ],
  low: [
    'stress',
    'cang thang',
    'met moi',
    'buon',
    'co don',
    'ap luc',
    'mat dong luc',
    'chan nan',
    'bat an',
    'qua tai',
    'tu ti'
  ]
}

const includesAny = (text, phrases) => phrases.some((phrase) => text.includes(phrase))

export const assessMentalHealthRisk = (message) => {
  const text = normalize(message)

  if (includesAny(text, keywordGroups.emergency)) {
    return {
      level: 'emergency',
      label: 'Khẩn cấp',
      shouldUseAI: false,
      needsHumanSupport: true
    }
  }

  if (includesAny(text, keywordGroups.high)) {
    return {
      level: 'high',
      label: 'Rủi ro cao',
      shouldUseAI: false,
      needsHumanSupport: true
    }
  }

  if (includesAny(text, keywordGroups.medium)) {
    return {
      level: 'medium',
      label: 'Cần chú ý',
      shouldUseAI: true,
      needsHumanSupport: true
    }
  }

  if (includesAny(text, keywordGroups.low)) {
    return {
      level: 'low',
      label: 'Hỗ trợ nhẹ',
      shouldUseAI: true,
      needsHumanSupport: false
    }
  }

  return {
    level: 'general',
    label: 'Trao đổi chung',
    shouldUseAI: true,
    needsHumanSupport: false
  }
}

export const createCrisisResponse = (risk) => {
  const isEmergency = risk.level === 'emergency'

  const emergencyPrefix = isEmergency
    ? 'Điều bạn vừa chia sẻ nghe có vẻ đang rất khẩn cấp. Mình lo cho bạn lúc này.'
    : 'Mình rất tiếc vì bạn đang phải chịu cảm giác nặng như vậy. Bạn không phải đi qua điều này một mình.'

  const hotlines = `
📞 Đường dây hỗ trợ sức khỏe tâm thần (Việt Nam):
• Đường dây hỗ trợ tâm lý: 1800 599 920 (miễn phí, 24/7)
• Cấp cứu y tế: 115
• Đường dây bảo vệ trẻ em: 111`

  const steps = isEmergency
    ? `
Ngay lúc này, xin hãy làm một trong những điều sau:
1. Gọi 115 hoặc đến cơ sở y tế gần nhất ngay lập tức.
2. Nhắn hoặc gọi cho một người đáng tin cậy và nói: "Mình đang không an toàn, hãy ở cùng mình."
3. Đặt xa các vật có thể gây hại và di chuyển tới nơi có người khác.`
    : `
Một vài bước nhỏ có thể giúp bạn ngay lúc này:
1. Gọi hoặc nhắn cho một người bạn tin tưởng — chỉ cần nói "Mình đang không ổn."
2. Nếu cảm giác quá nặng, hãy gọi đường dây hỗ trợ tâm lý 1800 599 920 (miễn phí).
3. Nếu bạn lo ngại về sự an toàn của bản thân, hãy gọi 115.`

  return `${emergencyPrefix}
${steps}
${hotlines}

Bạn không cần giải quyết toàn bộ cuộc đời trong vài phút này. Việc quan trọng nhất là đi qua khoảnh khắc này trước.`
}

export const getSafetyDisclosure = () =>
  'Isla chỉ hỗ trợ tự chăm sóc tinh thần và giáo dục tâm lí. Isla không chẩn đoán, không kê thuốc, không thay thế bác sĩ, nhà tâm lí hoặc dịch vụ khẩn cấp.'