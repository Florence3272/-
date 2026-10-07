package com.cnru.termbank.service;

import com.cnru.termbank.common.ApiException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

/** 从上传文件中抽取纯文本（文件翻译用） */
@Service
public class FileExtractService {

    private static final List<String> TEXT_EXT = Arrays.asList(".txt", ".md", ".csv", ".json");

    public String extract(String filePath, String originalName) {
        String lower = originalName.toLowerCase();
        try {
            if (TEXT_EXT.stream().anyMatch(lower::endsWith)) {
                return new String(Files.readAllBytes(Paths.get(filePath)), StandardCharsets.UTF_8);
            }
            if (lower.endsWith(".docx")) {
                try (InputStream in = new FileInputStream(filePath);
                     XWPFDocument doc = new XWPFDocument(in);
                     XWPFWordExtractor ex = new XWPFWordExtractor(doc)) {
                    return ex.getText();
                }
            }
            if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
                try (InputStream in = new FileInputStream(filePath);
                     Workbook wb = WorkbookFactory.create(in)) {
                    StringBuilder sb = new StringBuilder();
                    for (int s = 0; s < wb.getNumberOfSheets(); s++) {
                        Sheet sheet = wb.getSheetAt(s);
                        sb.append("# ").append(sheet.getSheetName()).append("\n");
                        for (Row row : sheet) {
                            StringBuilder line = new StringBuilder();
                            for (Cell cell : row) {
                                if (line.length() > 0) line.append("\t");
                                line.append(cell.toString());
                            }
                            sb.append(line).append("\n");
                        }
                    }
                    return sb.toString();
                }
            }
            throw ApiException.badRequest("暂不支持解析该文件类型：" + originalName);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw ApiException.badRequest("文件解析失败：" + e.getMessage());
        }
    }
}
