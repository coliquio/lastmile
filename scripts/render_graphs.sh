#!/bin/sh

GRAPHS_PATHS=(docs/concept)
for graph_path in "${GRAPHS_PATHS[@]}"; do
  cat $graph_path.dot | dot -Tpng > $graph_path.png
done