package com.rentnest.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // 1. Catches standard HTTP errors (like 400 Bad Request for taken emails)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", e.getReason());
        return ResponseEntity.status(e.getStatusCode()).body(response);
    }

    // 2. Catches ALL OTHER silent crashes (500 errors) and forces them to print!
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllOtherExceptions(Exception e) {
        // THIS LINE PROVES WHAT WENT WRONG IN INTELLIJ
        e.printStackTrace();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Server Error: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}