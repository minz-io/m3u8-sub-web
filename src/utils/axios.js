import axios from "axios";

// baseURL 基础配置API 路径
const baseURL = import.meta.env.VITE_APP_API;

// queryService 基本的请求服务
export const queryService = axios.create({
    baseURL: baseURL,
});

// queryService 请求拦截器
queryService.interceptors.request.use(
    function(config) {

        // 获取请求的url
        const url = config.url

        // 发送请求前会做的事情
        if(!config.headers['Content-Type']){
            config.headers['Content-Type'] = "application/json"
        }

        return config;
    },
    function(error) {
        // 请求错误要做的事情
        return Promise.reject(error);
    }
);

// queryService 响应拦截器
queryService.interceptors.response.use(
    function(response) {

        // -1
        if (response.status===200 && response.data?.code === -1){
            alert(response.data?.msg)
            return Promise.reject(response.data)
        }

        return response.data
    },
    function(error) {
        return Promise.reject(error);
    }
);
