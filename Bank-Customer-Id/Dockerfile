FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/customer-service-*.jar app.jar
EXPOSE 3000
ENTRYPOINT ["java", "-jar", "app.jar"]
