package com.stockportfolio.stockportfolioanalyzer.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "stock")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String symbol;

    @Column(nullable = false)
    private String companyname;

    @Column(nullable = false)
    private String sector;

    @Column(nullable = false)
    private Double currentprice;

    @JsonIgnore
    @OneToMany(mappedBy = "stock")
    private List<Transaction> transactions;

}
