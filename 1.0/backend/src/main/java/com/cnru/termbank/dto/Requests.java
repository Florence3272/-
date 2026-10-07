package com.cnru.termbank.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

/** 请求体 DTO 集合（按用途分组，避免文件过多） */
public class Requests {

    @Data
    public static class RegisterReq {
        @NotBlank(message = "用户名不能为空")
        @Size(min = 3, max = 20, message = "用户名长度需 3-20 位")
        private String username;
        @NotBlank(message = "密码不能为空")
        @Size(min = 6, max = 30, message = "密码长度需 6-30 位")
        private String password;
        private String name;
        private String email;
    }

    @Data
    public static class LoginReq {
        @NotBlank(message = "请输入用户名")
        private String username;
        @NotBlank(message = "请输入密码")
        private String password;
    }

    @Data
    public static class ProfileReq {
        private String name;
        private String email;
        private String phone;
        private String avatar;
        private String bio;
    }

    @Data
    public static class PasswordReq {
        @NotBlank(message = "请输入原密码")
        private String oldPassword;
        @NotBlank(message = "新密码至少6个字符")
        @Size(min = 6, max = 30, message = "新密码长度需 6-30 位")
        private String newPassword;
    }

    @Data
    public static class DatabaseReq {
        @NotBlank(message = "请填写库名称")
        private String name;
        @NotBlank(message = "请填写所属领域")
        private String category;
        private String description;
        private String visibility;
    }

    @Data
    public static class MemberReq {
        @NotBlank(message = "请填写用户名")
        private String username;
        private String role = "viewer";
    }

    @Data
    public static class TermReq {
        private Long dbId;
        @NotBlank(message = "请填写中文名")
        private String cnTerm;
        @NotBlank(message = "请填写俄文名")
        private String ruTerm;
        private String enTerm;
        private String definition;
        private String context;
        private String cultureNote;
        private String pos;
        private String tags;
        private String changeNote;
    }

    @Data
    public static class ImportReq {
        private Long dbId;
        private List<TermReq> items;
    }

    @Data
    public static class MediaReq {
        private String type;
        private String url;
        private String description;
        private Integer sortOrder = 0;
    }

    @Data
    public static class RelationReq {
        private Long relatedTermId;
        private String relationType = "related";
    }

    @Data
    public static class ResourceReq {
        private Long dbId;
        private String moduleType;
        private String title;
        private String content;
        private String coverUrl;
        private String mediaUrl;
        private String difficulty;
        private Integer duration;
    }

    @Data
    public static class RecordReq {
        private String targetType = "term";
        private Long targetId;
        private Long dbId;
        private String mode;
        private Integer score;
        private Integer correctCount;
        private Integer totalCount;
        private Integer duration;
        private Object detail;
    }

    @Data
    public static class TranslateReq {
        @NotBlank(message = "请输入待翻译文本")
        private String text;
        private String sourceLang = "zh";
        private String targetLang = "ru";
    }

    @Data
    public static class FileTranslateReq {
        private String sourceLang = "zh";
    }

    @Data
    public static class FavoriteReq {
        private String targetType = "term";
        private Long targetId;
        private String notes;
    }

    @Data
    public static class NoteReq {
        private String targetType = "custom";
        private Long targetId;
        private String title;
        @NotBlank(message = "笔记内容不能为空")
        private String content;
    }

    @Data
    public static class AnnouncementReq {
        @NotBlank(message = "请填写标题")
        private String title;
        private String content;
        private String type = "notice";
        private String linkUrl;
        private String status = "published";
        private Integer sortOrder = 0;
    }

    @Data
    public static class RoleReq {
        @NotBlank(message = "角色不能为空")
        private String role;
    }

    @Data
    public static class StatusReq {
        @NotBlank(message = "状态不能为空")
        private String status;
    }

    @Data
    public static class FeedbackReq {
        private Long taskId;
        private Integer score;
        private String comment;
    }
}
