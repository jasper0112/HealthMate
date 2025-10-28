package com.example.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class DatabaseTestController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/database")
    public Map<String, Object> testDatabaseConnection() {
        Map<String, Object> result = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            result.put("status", "success");
            result.put("message", "Database connection successful");
            result.put("database", connection.getCatalog());
            result.put("url", connection.getMetaData().getURL());
            result.put("driver", connection.getMetaData().getDriverName());
            result.put("version", connection.getMetaData().getDriverVersion());
        } catch (SQLException e) {
            result.put("status", "error");
            result.put("message", "Database connection failed: " + e.getMessage());
            result.put("error", e.getClass().getSimpleName());
        }
        
        return result;
    }
}
