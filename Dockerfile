# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.8.5-openjdk-17 AS backend-builder
WORKDIR /app
COPY pom.xml ./
COPY src/ ./src/
# Copy the compiled static assets from the frontend build stage into Spring Boot's static resources
COPY --from=frontend-builder /app/frontend/dist/ ./src/main/resources/static/
RUN mvn clean package -DskipTests

# Stage 3: Run the application
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=backend-builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
