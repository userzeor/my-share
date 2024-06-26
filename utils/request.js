import axios from 'axios'
// 创建axios请求
const http = axios.create({
  // 请求域名
  baseURL: 'http://192.168.110.32:3000',
  // 设置超时时间
  timeout: 1000 * 30,
  // 跨域情况下带上cookie
  withCredentials: false,
  // 设置默认请求头，之后可以随便改
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
  // headers: {
  //   'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  // },
  maxRedirects: 1,
  // 配置是否使用默认api
  notUseDefaultApi: false,
})

export default http
