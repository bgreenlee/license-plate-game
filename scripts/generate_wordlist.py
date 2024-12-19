#!/usr/bin/env python3
import os
import re

# this script is meant to be run from the root directory of the project
rootdir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..')
datadir = os.path.join(rootdir, "data")
jsdir = os.path.join(rootdir, "js")

# read the main word list
with open(os.path.join(datadir, "nwl2020.txt")) as f:
    nwl_words = f.read().strip().split("\n")

# read the top N words list
with open(os.path.join(datadir, "top-words.txt")) as f:
    top_words = set(f.read().strip().split("\n"))

# filter out invalid words
nwl_words = set([w for w in nwl_words if len(w) >= 4])

common_words = nwl_words.intersection(top_words)
uncommon_words = nwl_words - common_words

# output the final word list to words.js
with open(os.path.join(jsdir, "words.js"), "w") as f:
    f.write("export const Words = {\n  common: `")
    f.write(" ".join(sorted(common_words)))
    f.write("`,\n  uncommon: `")
    f.write(" ".join(sorted(uncommon_words)))
    f.write("`\n};")

