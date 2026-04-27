package com.auction.auction_system;

import com.auction.auction_system.model.Product;
import com.auction.auction_system.model.User;
import com.auction.auction_system.repository.ProductRepository;
import com.auction.auction_system.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AdminControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    public void testGetAllUsers() {
        // Setup
        User user = new User();
        user.setName("Admin Test User");
        user.setEmail("admintest@example.com");
        user.setPassword("password");
        userRepository.save(user);

        // Execute
        ResponseEntity<List> response = restTemplate.getForEntity("/admin/users", List.class);

        // Verify
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotEmpty();
    }

    @Test
    public void testDeleteUser() {
        // Setup
        User user = new User();
        user.setName("To Delete");
        user.setEmail("delete@example.com");
        user.setPassword("password");
        user = userRepository.save(user);
        Long userId = user.getId();

        // Execute
        ResponseEntity<String> response = restTemplate.exchange(
                "/admin/users/" + userId,
                HttpMethod.DELETE,
                null,
                String.class
        );

        // Verify
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("User deleted successfully");
        assertThat(userRepository.findById(userId)).isEmpty();
    }

    @Test
    public void testDeleteProduct() {
        // Setup
        Product product = new Product();
        product.setName("Product to Delete");
        product.setBasePrice(50.0);
        product = productRepository.save(product);
        Long productId = product.getId();

        // Execute
        ResponseEntity<String> response = restTemplate.exchange(
                "/admin/products/" + productId,
                HttpMethod.DELETE,
                null,
                String.class
        );

        // Verify
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("Product deleted successfully");
        assertThat(productRepository.findById(productId)).isEmpty();
    }
}
