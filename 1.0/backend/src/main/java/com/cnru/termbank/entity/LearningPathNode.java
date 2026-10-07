package com.cnru.termbank.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 学习路径节点 */
@Data
@TableName("learning_path_nodes")
public class LearningPathNode {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long pathId;
    private Long dbId;
    private Long resourceId;
    private String title;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}
