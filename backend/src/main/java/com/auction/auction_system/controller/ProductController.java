package com.auction.auction_system.controller;
import java.time.LocalDateTime;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.auction.auction_system.model.Product;
import com.auction.auction_system.model.User;
import com.auction.auction_system.repository.ProductRepository;
import com.auction.auction_system.repository.UserRepository;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
public class ProductController {
	 @Autowired
	    private ProductRepository productRepo;
	 @Autowired
	 private UserRepository userRepo;
	 @Autowired
	 private BidWebSocketController webSocketController;

    private final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            System.err.println("Upload failed: File is empty");
            return "File is empty";
        }
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            System.out.println("Attempting to save file to: " + path.toAbsolutePath());
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());
            System.out.println("File saved successfully: " + fileName);
            return "/uploads/" + fileName;
        } catch (Exception e) {
            System.err.println("Upload exception: " + e.getMessage());
            e.printStackTrace();
            return "Upload failed: " + e.getMessage();
        }
    }

	    // ✅ Add Product
	 @PostMapping("/add")
	 public String addProduct(@RequestBody Product product,
	                          @RequestParam Long userId) {

	     User user = userRepo.findById(userId).orElse(null);

	     if (user == null) {
    		return "User not found";
}
	     LocalDateTime now = LocalDateTime.now();

	     product.setStartTime(now);
	     product.setEndTime(now.plusMinutes(2)); // Default to 2 minutes for testing
	     product.setCurrentHighestBid(product.getBasePrice());
	     product.setClosed(false);
	     product.setOwnerId(userId);

	     productRepo.save(product);
	     webSocketController.sendUpdate("/topic/products", product);

	     return "Product added successfully";
	 }

	    // ✅ View Products
	    @GetMapping("/all")
	    public List<Product> getAllProducts() {
	        return productRepo.findAll();
	    }

	    @GetMapping("/{id}")
	    public Product getProductById(@PathVariable Long id) {
	        return productRepo.findById(id).orElse(null);
	    }

	    @PutMapping("/close/{id}")
	    public String closeAuction(@PathVariable Long id) {

	        Product product = productRepo.findById(id).orElse(null);

	        if (product == null) return "Product not found";

	        product.setClosed(true);
	        productRepo.save(product);

	        return "Auction closed manually";
	    }
	    @GetMapping("/time-left/{id}")
	    public Object getTimeLeft(@PathVariable Long id) {

	        Product product = productRepo.findById(id).orElse(null);

	        if (product == null) return Collections.singletonMap("error", "Product not found");

	        LocalDateTime now = LocalDateTime.now();

	        if (now.isAfter(product.getEndTime())) {
	            return Collections.singletonMap("status", "ended");
	        }

	        long seconds = java.time.Duration.between(now, product.getEndTime()).getSeconds();
	        
	        Map<String, Object> response = new HashMap<>();
	        response.put("seconds", seconds);
	        response.put("status", "running");
	        return response;
	    }
	    @GetMapping("/my-wins")
	    public List<Product> getMyWins(@RequestParam Long userId) {
	        return productRepo.findByWinnerUserId(userId);
	    }
	    @GetMapping("/status/{productId}")
	    public Object getStatus(@PathVariable Long productId) {

	        Product product = productRepo.findById(productId).orElse(null);

	        if (product == null) return Collections.singletonMap("error", "Product not found");

	        LocalDateTime now = LocalDateTime.now();
	        Map<String, Object> response = new HashMap<>();

	        if (now.isBefore(product.getStartTime())) {
	            response.put("status", "pending");
	            response.put("message", "Auction not started");
	        } else if (now.isAfter(product.getEndTime())) {
	            response.put("status", "ended");
	            response.put("message", "Auction ended");
	            if (product.getWinnerUserId() != null) {
	                User winner = userRepo.findById(product.getWinnerUserId()).orElse(null);
	                response.put("winner", winner != null ? winner.getName() : "Unknown");
	            }
	        } else {
	            response.put("status", "running");
	            long secondsLeft = java.time.Duration.between(now, product.getEndTime()).getSeconds();
	            response.put("secondsLeft", secondsLeft);
	        }

	        return response;
	    }
	    @GetMapping("/winner/{productId}")
	    public String getWinner(@PathVariable Long productId) {

	        Product product = productRepo.findById(productId).orElse(null);

	        if (product == null) return "Product not found";

	        if (product.getWinnerUserId() == null) {
	            return "No bids yet";
	        }

	        User winner = userRepo.findById(product.getWinnerUserId()).orElse(null);

	        return "Winner: " + winner.getName();
	    }
	    

}
