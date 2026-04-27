package com.auction.auction_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.auction.auction_system.model.Product;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByWinnerUserId(Long userId); // ✅ ADD THIS
}