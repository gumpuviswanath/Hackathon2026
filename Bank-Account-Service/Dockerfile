FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/account-service-*.jar app.jar
EXPOSE 3002
ENTRYPOINT ["java", "-jar", "app.jar"]
