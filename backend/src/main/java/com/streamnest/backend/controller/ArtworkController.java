package com.streamnest.backend.controller;

import com.mpatric.mp3agic.ID3v2;
import com.mpatric.mp3agic.Mp3File;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/api")
public class ArtworkController {

    @Value("${streamnest.music-path}")
    private String musicPath;

    @GetMapping("/artwork/{id}")
    public ResponseEntity<byte[]> artwork(
            @PathVariable String id
    ) {

        File folder = new File(musicPath);

        File[] files = folder.listFiles();

        if(files == null){
            return ResponseEntity.notFound().build();
        }

        for(File file : files){

            String fileId =
                    String.valueOf(
                            file.getAbsolutePath().hashCode()
                    );

            if(!fileId.equals(id)){
                continue;
            }

            try{

                Mp3File mp3 = new Mp3File(file);

                if(mp3.hasId3v2Tag()){

                    ID3v2 tag = mp3.getId3v2Tag();

                    byte[] image =
                            tag.getAlbumImage();

                    if(image != null){

                        return ResponseEntity.ok()
                                .contentType(
                                        MediaType.IMAGE_JPEG
                                )
                                .body(image);
                    }
                }

            }catch(Exception e){
                e.printStackTrace();
            }
        }

        return ResponseEntity.notFound().build();
    }
}