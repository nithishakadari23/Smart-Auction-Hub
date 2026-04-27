package com.auction.auction_system.controller;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.auction.auction_system.model.User;
import com.auction.auction_system.repository.UserRepository;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {
	@Autowired
    private UserRepository userRepo;

    // ✅ Register User
	@PostMapping("/register")
	public User register(@RequestBody User user) {

	    System.out.println("NAME: " + user.getName());
	    System.out.println("EMAIL: " + user.getEmail());
	    System.out.println("PASSWORD: " + user.getPassword());
	    System.out.println("ROLE: " + user.getRole());

	    return userRepo.save(user);
	}
	// ✅ Get All Users
	@GetMapping("/all")
	public List<User> getAllUsers() {
	    return userRepo.findAll();
	}
	@GetMapping("/{id}")
	public User getUserById(@PathVariable Long id) {
	    return userRepo.findById(id).orElse(null);
	}
	
	@PostMapping("/login")
	public Object login(@RequestParam String email,
	                    @RequestParam String password) {

	    User user = userRepo.findByEmail(email);

	    if (user == null) {
	        return Collections.singletonMap("error", "User not found");
	    }

	    if (!user.getPassword().equals(password)) {
	        return Collections.singletonMap("error", "Invalid password");
	    }

	    Map<String, Object> response = new HashMap<>();
	    response.put("id", user.getId());
	    response.put("name", user.getName());
	    response.put("role", user.getRole());
	    response.put("message", "Login successful");
	    
	    return response;
	}
	@GetMapping("/dashboard")
	public String dashboard(@RequestParam Long userId) {

	    User user = userRepo.findById(userId).orElse(null);

	    if (user == null) return "User not found";

	    return "Welcome " + user.getName() + " | Role: " + user.getRole();
	}
}
