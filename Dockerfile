# 第一阶段：node镜像打包
FROM node:latest AS frontend-builder
WORKDIR /build-app

# 安装 pnpm
RUN npm install -g pnpm

# 复制依赖描述文件（建议单独 COPY）
COPY pnpm-lock.yaml ./
COPY package.json ./

# 安装依赖
RUN pnpm install

# 复制剩余代码
COPY . .

# 构建应用
RUN pnpm run build


# 第二阶段：nginx打包
FROM nginx:latest
EXPOSE 80
WORKDIR /app
# 替换nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 将第一阶段的静态文件复制到nginx中
RUN rm -rf /usr/share/nginx/html
RUN mkdir /usr/share/nginx/html
COPY --from=frontend-builder /build-app/dist /usr/share/nginx/html

# 运行
CMD ["nginx", "-g", "daemon off;"]
