package com.auction.auction_system;

import com.auction.auction_system.model.Product;
import com.auction.auction_system.model.User;
import com.auction.auction_system.repository.ProductRepository;
import com.auction.auction_system.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ProductControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    public void testAddProductWithCategory() {
        // Setup user
        User user = new User();
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("password");
        user.setRole("SELLER");
        user = userRepository.save(user);

        // Setup product
        Product product = new Product();
        product.setName("Test Product");
        product.setBasePrice(100.0);
        product.setCategory("Electronics");

        // Execute
        ResponseEntity<String> response = restTemplate.postForEntity(
                "/products/add?userId=" + user.getId(),
                product,
                String.class
        );

        // Verify
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Product added successfully");

        Product savedProduct = productRepository.findAll().stream()
                .filter(p -> p.getName().equals("Test Product"))
                .findFirst()
                .orElseThrow();
        
        assertThat(savedProduct.getCategory()).isEqualTo("Electronics");
    }
}
