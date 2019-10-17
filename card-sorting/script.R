# set your project folder

# load clustering function
source("cluster-card-sorting.R")
source("ggdendro.R")

# load datasets
datasets = list(
  list(name="Alfredo", file="data/Alfredo.csv"),
  list(name="Rafael", file="data/Rafael.csv")
)

# get clusters
clusters <- getCardSortingClusters(datasets)
# plot hierarchical clusters
getClustersPlot(clusters$hclust, k=2)

# plot clusters table
table <- getClusterTable(hclust=clusters$hclust, k=median_clusters, index_df=clusters$index_df)
View(table)

# plot confidence table
getConfPlot(clusters$conf_matrix)
View(clusters$conf_matrix)