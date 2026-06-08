import { QuestionTemplate, Option } from '@/types/survey';
import { v4 as uuidv4 } from 'uuid';

const createOptions = (labels: string[]): Option[] =>
  labels.map((label, index) => ({
    id: uuidv4(),
    label,
    value: label,
    order: index,
  }));

export const questionLibrary: QuestionTemplate[] = [
  {
    id: uuidv4(),
    type: 'single',
    title: '您的性别是？',
    category: '人口统计',
    options: createOptions(['男', '女', '其他', '不愿透露']),
  },
  {
    id: uuidv4(),
    type: 'single',
    title: '您的年龄段是？',
    category: '人口统计',
    options: createOptions(['18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-55岁', '56岁以上']),
  },
  {
    id: uuidv4(),
    type: 'single',
    title: '您的最高学历是？',
    category: '人口统计',
    options: createOptions(['初中及以下', '高中/中专', '大专', '本科', '硕士', '博士及以上']),
  },
  {
    id: uuidv4(),
    type: 'single',
    title: '您的职业是？',
    category: '人口统计',
    options: createOptions(['学生', '企业员工', '公务员/事业单位', '自由职业', '创业者', '退休', '其他']),
  },
  {
    id: uuidv4(),
    type: 'multiple',
    title: '您通常通过哪些渠道获取信息？（可多选）',
    category: '行为习惯',
    options: createOptions(['微信/朋友圈', '微博', '抖音/快手', '小红书', '知乎', '搜索引擎', '新闻APP', '朋友推荐', '其他']),
  },
  {
    id: uuidv4(),
    type: 'multiple',
    title: '您在购买产品时主要考虑哪些因素？（可多选）',
    category: '行为习惯',
    options: createOptions(['价格', '品牌', '质量', '外观设计', '功能', '用户评价', '售后服务', '促销活动', '其他']),
  },
  {
    id: uuidv4(),
    type: 'rating',
    title: '您对我们产品的整体满意度如何？',
    category: '满意度调查',
  },
  {
    id: uuidv4(),
    type: 'rating',
    title: '您对我们客户服务的满意度如何？',
    category: '满意度调查',
  },
  {
    id: uuidv4(),
    type: 'rating',
    title: '您向朋友推荐我们产品的可能性有多大？',
    category: '满意度调查',
  },
  {
    id: uuidv4(),
    type: 'ranking',
    title: '请按重要性对以下因素排序（最重要排第一）',
    category: '偏好调查',
    options: createOptions(['产品质量', '价格合理', '品牌知名度', '售后服务', '外观设计', '功能丰富']),
  },
  {
    id: uuidv4(),
    type: 'single',
    title: '您是如何了解到我们的产品的？',
    category: '市场调研',
    options: createOptions(['搜索引擎', '社交媒体广告', '朋友推荐', '线下门店', '电商平台', '其他']),
  },
  {
    id: uuidv4(),
    type: 'text',
    title: '您对我们产品有什么改进建议？',
    category: '意见反馈',
  },
  {
    id: uuidv4(),
    type: 'text',
    title: '请描述一下您使用产品的主要场景',
    category: '意见反馈',
  },
  {
    id: uuidv4(),
    type: 'single',
    title: '您是否愿意参加我们的后续调研？',
    category: '其他',
    options: createOptions(['非常愿意', '愿意', '无所谓', '不太愿意', '完全不愿意']),
  },
];

export const categories = [
  '全部',
  '人口统计',
  '行为习惯',
  '满意度调查',
  '偏好调查',
  '市场调研',
  '意见反馈',
  '其他',
];
