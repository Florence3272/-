package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 学习记录 */
@Data
@TableName("learning_records")
public class LearningRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long dbId;
    private String targetType;
    private Long targetId;
    private String mode;
    private Integer score;
    private Integer correctCount;
    private Integer totalCount;
    private Integer duration;
    /** JSON 明细，存字符串 */
    private String detail;
    private LocalDateTime createdAt;
}
