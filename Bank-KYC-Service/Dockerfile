FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/kyc-service-*.jar app.jar
EXPOSE 3001
ENTRYPOINT ["java", "-jar", "app.jar"]
