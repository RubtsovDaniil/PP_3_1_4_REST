package ru.kata.spring.boot_security.demo.exeptionhandler;

public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
