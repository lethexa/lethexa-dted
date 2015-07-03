/*
 * Copyright (c) 2015, Tim Leerhoff <tleerhof@web.de>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */


/* global module */

module.exports.Tile = function (buffer) {
    'use strict';


    var readUHL = function (startByte) {
        var uhl = buffer.toString('ascii', startByte + 0, startByte + 3);
        var lonOfOrigin = buffer.toString('ascii', startByte + 4, startByte + 12);
        var latOfOrigin = buffer.toString('ascii', startByte + 12, startByte + 20);

        console.log(uhl);
        console.log(lonOfOrigin);
        console.log(latOfOrigin);
        /*
         truct UHLStruct
         {
         char uhl[3];              // recognition sentinel - should be "UHL"
         char dummy;               // additional byte
         char longitude_origin[8]; // longitude in DDDMMSSH at origin (LLC)
         char latitude_origin[8];  // latitude in DDDMMSSH at origin (LLC)
         char delta_longitude[4];  // longitude increments in 10ths of seconds
         char delta_latitude[4];   // latitude increments in 10ths of seconds
         char vertical_accuracy[4];// absolute vertical accuracy (meters)
         char security_code[3];    // if this is T, S, or C, then you can't look at the data
         char unique_reference[12];
         char num_long_lines[4];   // number of longitude lines
         char num_lat_lines[4];    // number of latitude points per longitude line
         char multiple_accuracy;   // 0 - single, 1 - multiple
         char reserved[24];
         };
         */
    };


    readUHL(0);
};
