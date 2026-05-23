package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

type Task struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
}

var db *sql.DB

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("ไม่มีไฟล์ .env ใช้ค่า Environment เริ่มต้นของระบบ")
	}

	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPass, dbHost, dbPort, dbName)

	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("เชื่อมต่อ Database ไม่สำเร็จ:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("Database Ping ไม่ผ่าน:", err)
	}
	log.Println("✅ เชื่อมต่อฐานข้อมูลสำเร็จ!")

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type"},
	}))

	r.GET("/api/tasks", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, title, description, status, created_at FROM tasks ORDER BY id DESC")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ดึงข้อมูลไม่ได้"})
			return
		}
		defer rows.Close()

		var tasks []Task
		for rows.Next() {
			var t Task
			if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Status, &t.CreatedAt); err != nil {
				continue
			}
			tasks = append(tasks, t)
		}

		if tasks == nil {
			tasks = []Task{}
		}
		c.JSON(http.StatusOK, tasks)
	})

	r.POST("/api/tasks", func(c *gin.Context) {
		var t Task
		if err := c.ShouldBindJSON(&t); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบข้อมูลไม่ถูกต้อง"})
			return
		}

		result, err := db.Exec("INSERT INTO tasks (title, description) VALUES (?, ?)", t.Title, t.Description)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกข้อมูลไม่ได้"})
			return
		}

		id, _ := result.LastInsertId()
		c.JSON(http.StatusCreated, gin.H{"id": id, "message": "สร้างงานสำเร็จ"})
	})

	r.PUT("/api/tasks/:id", func(c *gin.Context) {
		id := c.Param("id")
		var t Task
		if err := c.ShouldBindJSON(&t); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบข้อมูลไม่ถูกต้อง"})
			return
		}

		_, err := db.Exec("UPDATE tasks SET status = ? WHERE id = ?", t.Status, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตข้อมูลไม่ได้"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "อัปเดตสถานะสำเร็จ"})
	})

	r.DELETE("/api/tasks/:id", func(c *gin.Context) {
		id := c.Param("id")
		_, err := db.Exec("DELETE FROM tasks WHERE id = ?", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ลบข้อมูลไม่ได้"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "ลบงานสำเร็จ"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on http://localhost:%sn", port)
	r.Run(":" + port)
}
