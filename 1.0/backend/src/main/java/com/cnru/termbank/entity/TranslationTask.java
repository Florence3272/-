package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 翻译任务 */
@Data
@TableName("translation_tasks")
public class TranslationTask {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String taskType;
    private String sourceLang;
    private String targetLang;
    private String sourceText;
    private String resultText;
    private String matchedTerms;
    private String fileName;
    private String fileUrl;
    private String resultFileUrl;
    private String status;
    private String errorMsg;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
