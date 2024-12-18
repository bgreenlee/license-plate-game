#!/usr/bin/env python3
import os
import re

# this script is meant to be run from the root directory of the project
rootdir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..')
datadir = os.path.join(rootdir, "data")

# read the NASPA word list
with open(os.path.join(datadir, "wordnik.txt")) as f:
    nwl_words = f.read().strip().split("\n")

# filter out invalid words
nwl_words = set([w for w in nwl_words if len(w) >= 4])

# output the final word list as a single space-separated string
with open(os.path.join(datadir, "words-filtered"), "w") as f:
    f.write(" ".join(sorted(nwl_words)))
