package com.cnru.termbank.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cnru.termbank.common.ApiException;
import com.cnru.termbank.common.Result;
import com.cnru.termbank.dto.Requests;
import com.cnru.termbank.entity.TranslationTask;
import com.cnru.termbank.mapper.TranslationTaskMapper;
import com.cnru.termbank.security.UserContext;
import com.cnru.termbank.service.FileExtractService;
import com.cnru.termbank.service.TranslateService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/translate")
public class TranslateController {

    private final TranslateService translateService;
    private final FileExtractService fileExtractService;
    private final TranslationTaskMapper taskMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public TranslateController(TranslateService translateService, FileExtractService fileExtractService,
                               TranslationTaskMapper taskMapper) {
        this.translateService = translateService;
        this.fileExtractService = fileExtractService;
        this.taskMapper = taskMapper;
    }

    @PostMapping("/text")
    public Result<Map<String, Object>> text(@RequestBody Requests.TranslateReq req) {
        TranslateService.TranslateResult r = translateService.translate(req.getText(), req.getSourceLang());

        UserContext.CurrentUser cu = UserContext.get();
        if (cu != null) {
            TranslationTask task = new TranslationTask();
            task.setUserId(cu.id);
            task.setTaskType("text");
            task.setSourceLang(req.getSourceLang());
            task.setTargetLang(req.getTargetLang());
            task.setSourceText(req.getText());
            task.setResultText(r.result);
            try {
                task.setMatchedTerms(objectMapper.writeValueAsString(r.matchedTerms));
            } catch (Exception ignored) {
            }
            task.setStatus("completed");
            task.setCompletedAt(LocalDateTime.now());
            taskMapper.insert(task);
        }

        List<Map<String, Object>> matched = new ArrayList<>();
        for (int i = 0; i < Math.min(10, r.matchedTerms.size()); i++) {
            TranslateService.Matched m = r.matchedTerms.get(i);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("cn", m.cn);
            item.put("ru", m.ru);
            item.put("source", m.source);
            matched.add(item);
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("result", r.result);
        out.put("matchedTerms", matched);
        out.put("isMachineTranslated", r.isMachineTranslated);
        return Result.ok(out);
    }

    @PostMapping("/file")
    public Result<TranslationTask> file(@RequestParam("file") MultipartFile file,
                                        @RequestParam(defaultValue = "zh") String sourceLang) throws Exception {
        UserContext.CurrentUser cu = UserContext.require();
        if (file == null || file.isEmpty()) throw ApiException.badRequest("请上传文件");

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
        String safeName = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
        Path saved = Paths.get(uploadDir, System.currentTimeMillis() + "-" + safeName);
        file.transferTo(saved.toFile());

        String targetLang = "zh".equals(sourceLang) ? "ru" : "zh";
        TranslationTask task = new TranslationTask();
        task.setUserId(cu.id);
        task.setTaskType("file");
        task.setSourceLang(sourceLang);
        task.setTargetLang(targetLang);
        task.setSourceText("");
        task.setFileName(safeName);
        task.setStatus("processing");
        taskMapper.insert(task);

        try {
            String text = fileExtractService.extract(saved.toString(), safeName);
            TranslateService.TranslateResult r = translateService.translate(text, sourceLang);
            Path outPath = Paths.get(uploadDir, "result-" + task.getId() + ".txt");
            Files.write(outPath, r.result.getBytes(StandardCharsets.UTF_8));

            task.setSourceText(text.length() > 60000 ? text.substring(0, 60000) : text);
            task.setResultText(r.result.length() > 60000 ? r.result.substring(0, 60000) : r.result);
            task.setMatchedTerms(objectMapper.writeValueAsString(r.matchedTerms));
            task.setResultFileUrl("/uploads/result-" + task.getId() + ".txt");
            task.setStatus("completed");
            task.setCompletedAt(LocalDateTime.now());
        } catch (ApiException e) {
            task.setStatus("failed");
            task.setErrorMsg(e.getMessage());
            taskMapper.updateById(task);
            throw e;
        } catch (Exception e) {
            task.setStatus("failed");
            task.setErrorMsg(e.getMessage());
            taskMapper.updateById(task);
            throw ApiException.badRequest("文件翻译失败：" + e.getMessage());
        }
        taskMapper.updateById(task);
        return Result.ok(task, "翻译完成");
    }

    @GetMapping("/tasks/{id}")
    public Result<TranslationTask> task(@PathVariable Long id) {
        Long uid = UserContext.require().id;
        TranslationTask task = taskMapper.selectOne(new QueryWrapper<TranslationTask>()
                .eq("id", id).eq("userId", uid).last("LIMIT 1"));
        if (task == null) throw ApiException.notFound("翻译任务不存在");
        return Result.ok(task);
    }

    @GetMapping("/history")
    public Result<List<TranslationTask>> history(@RequestParam(defaultValue = "20") Integer limit) {
        Long uid = UserContext.require().id;
        return Result.ok(taskMapper.selectList(new QueryWrapper<TranslationTask>()
                .eq("userId", uid).orderByDesc("createdAt").last("LIMIT " + limit)));
    }

    @DeleteMapping("/history/{id}")
    public Result<Void> deleteHistory(@PathVariable Long id) {
        Long uid = UserContext.require().id;
        taskMapper.delete(new QueryWrapper<TranslationTask>().eq("id", id).eq("userId", uid));
        return Result.ok(null, "已删除");
    }

    @GetMapping("/quick")
    public Result<Map<String, Object>> quick(@RequestParam String q) {
        return Result.ok(translateService.quickLookup(q));
    }
}
