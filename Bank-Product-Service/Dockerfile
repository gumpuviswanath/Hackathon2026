FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/product-service-*.jar app.jar
EXPOSE 3003
ENTRYPOINT ["java", "-jar", "app.jar"]
