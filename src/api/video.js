import { queryService } from '@/utils/axios.js'

export const video = {
  getList: (params) => queryService.get('/video', { params }),
  getDetail: (id) => queryService.get(`/video/${id}`),
}
