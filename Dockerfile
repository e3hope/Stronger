FROM node:20-slim

# 기본 패키지 설치 (git, procps 등)
RUN apt-get update && apt-get install -y \
    git \
    procps \
    watchman \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 글로벌 expo-cli는 더 이상 필수는 아니지만, 편리함을 위해 설치할 수 있습니다.
# 여기서는 npx를 주로 사용할 예정이므로 생략하거나 필요시 추가합니다.

EXPOSE 8081

CMD ["tail", "-f", "/dev/null"]
