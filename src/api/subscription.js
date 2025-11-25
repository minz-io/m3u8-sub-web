import { queryService } from '@/utils/axios.js'

export const subscription = {
  subscribe: (data) => queryService.post('/subscription', data),
  getSubscriptionList: () => queryService.get('/subscription'),
  unsubscribe: (id) => queryService.delete(`/subscription/${id}`),
  getSubscriptionDetail: (id) => queryService.get(`/subscription/${id}`),
}
