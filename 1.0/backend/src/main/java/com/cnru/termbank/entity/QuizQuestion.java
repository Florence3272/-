package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 试题库 */
@Data
@TableName("quiz_questions")
public class QuizQuestion {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long dbId;
    private Long resourceId;
    private String questionType;
    private String question;
    /** JSON 数组，存字符串 */
    private String options;
    private String answer;
    private String explanation;
    private String difficulty;
    private LocalDateTime createdAt;
}
