import request from '../utils/request.js'
// 虚拟定高数据
export const getVirtualList = (parmas) =>
  request({
    url: '/virtual/fixedHeightList',
    method: 'GET',
    parmas,
  })
