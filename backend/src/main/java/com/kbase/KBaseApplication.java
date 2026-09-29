package com.kbase;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
public class KBaseApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(KBaseApplication.class, args);
    }

    private static void loadDotEnv() {
        for (Path p : List.of(Path.of(".env"), Path.of("../.env"), Path.of("backend/.env"))) {
            if (Files.exists(p)) {
                try {
                    for (String line : Files.readAllLines(p)) {
                        line = line.trim();
                        if (!line.isEmpty() && !line.startsWith("#") && line.contains("=")) {
                            int eqIdx = line.indexOf('=');
                            String key = line.substring(0, eqIdx).trim();
                            String val = line.substring(eqIdx + 1).trim();
                            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                                val = val.substring(1, val.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                    System.out.println("[KBase] Successfully loaded environment variables from: " + p.toAbsolutePath());
                    break;
                } catch (Exception e) {
                    System.err.println("[KBase] Warning: Failed to parse .env: " + e.getMessage());
                }
            }
        }
    }
}
