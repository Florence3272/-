package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/** 学习路径 */
@Data
@TableName("learning_paths")
public class LearningPath {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String description;
    private String level;
    private String coverUrl;
    private Integer sortOrder;
    private String status;
    private LocalDateTime createdAt;

    @TableField(exist = false)
    private List<LearningPathNode> nodes;
}
