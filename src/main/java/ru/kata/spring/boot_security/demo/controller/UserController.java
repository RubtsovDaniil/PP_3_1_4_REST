//package ru.kata.spring.boot_security.demo.controller;
//
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Controller;
//import org.springframework.ui.Model;
//import org.springframework.web.bind.annotation.GetMapping;
//import ru.kata.spring.boot_security.demo.model.User;
//import ru.kata.spring.boot_security.demo.repository.UserRepository;
//
//import java.util.Optional;
//
//
//@Controller
//public class UserController {
//
//    private final UserRepository userRepository;
//
//    @Autowired
//    public UserController(UserRepository userRepository) {
//        this.userRepository = userRepository;
//    }
//
//    @GetMapping("/user")
//    public String showUserInfo(Model model) {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        Optional<User> user = userRepository.findByUsername(auth.getName());
//        model.addAttribute("user", user);
//        return "userInfo";
//    }
//}